import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getWizard } from '@/lib/wizard/registry';
import type { WizardStepRequest } from '@/lib/wizard/types';

export const runtime = 'nodejs';

/** Strip debug markers from content. */
function stripMarkers(text: string): string {
  if (!text || !text.trim()) return text;
  return text
    .replace(/---APPROVED_CONTENT---/g, '')
    .replace(/---END---/g, '')
    .replace(/\*\*APPROVED_CONTENT\*\*/g, '')
    .replace(/\*\*END\*\*/g, '')
    .trim();
}

/** Extract content between ---APPROVED_CONTENT--- and ---END--- from AI response. */
function extractApprovedContent(aiCoaching: string): string | null {
  const match = aiCoaching.match(/---APPROVED_CONTENT---\s*\n([\s\S]*?)\n---END---/);
  return match ? match[1].trim() : null;
}

/** Remove trailing incomplete lines (no period/question/exclamation or natural ending). */
function trimIncompleteContent(text: string): string {
  if (!text || !text.trim()) return text;
  const lines = text.split(/\r?\n/);
  let lastCompleteIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const endsWithPunctuation = /[.!?]$/.test(line);
    const looksLikeHeader = /^[A-Z\s\-|]+$/.test(line) && line.length <= 80;
    const endsWithYear = /\d{4}$/.test(line);
    if (endsWithPunctuation || looksLikeHeader || endsWithYear) {
      lastCompleteIndex = i;
    }
  }
  if (lastCompleteIndex < 0) return text.trim();
  return lines
    .slice(0, lastCompleteIndex + 1)
    .join('\n')
    .trim();
}

function buildArtifact(
  toolName: string,
  completedSteps: Array<Record<string, unknown>>,
  sessionData?: Record<string, unknown>
): string {
  if (toolName === 'resumes') {
    // Assemble from section steps only (0–4): Summary, Competencies, Experience, Education.
    // Never use step 5 (Final) finalOutput as artifact to avoid "Looks good" or duplication.
    const sectionSteps = completedSteps.filter(
      (s) => typeof s.stepNumber === 'number' && s.stepNumber >= 0 && s.stepNumber <= 4
    );
    const byStep = Object.fromEntries(
      sectionSteps.map((s) => [(s.stepNumber as number) + 1, s.finalOutput as string])
    );
    // Experience: use roles array if present (multi-role Step 4), else step 4 (stepNumber 3) finalOutput
    const roles = sessionData?.roles as string[] | undefined;
    const experienceSection = (roles && roles.length > 0)
      ? roles.map((r) => trimIncompleteContent(stripMarkers(r))).join('\n\n')
      : trimIncompleteContent(stripMarkers((byStep[4] as string) || ''));
    const parts = [
      trimIncompleteContent(stripMarkers((byStep[2] as string) || '')),
      trimIncompleteContent(stripMarkers((byStep[3] as string) || '')),
      experienceSection,
      trimIncompleteContent(stripMarkers((byStep[5] as string) || ''))
    ].filter(Boolean);
    return `YOUR FINISHED RÉSUMÉ\n${'='.repeat(50)}\n\n${parts.join('\n\n')}`;
  }
  return completedSteps.map((s) => trimIncompleteContent(stripMarkers((s.finalOutput as string) || ''))).join('\n\n');
}

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as WizardStepRequest & { advanceToNextStep?: boolean };
  const { sessionId, stepNumber, userInput, action, advanceToNextStep } = body;

  // Fetch session
  const { data: session, error: sessionError } = await supabase
    .from('tool_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const wizard = getWizard(session.tool_name);
  if (!wizard) return NextResponse.json({ error: 'Wizard not found' }, { status: 400 });

  // Handle "back" action
  if (action === 'back' && stepNumber > 0) {
    const prevStep = stepNumber - 1;
    await supabase
      .from('tool_sessions')
      .update({ current_step: prevStep, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return NextResponse.json({
      sessionId,
      currentStep: prevStep,
      totalSteps: wizard.totalSteps,
      aiCoaching: '',
      isComplete: false,
      step: wizard.steps[prevStep]
    });
  }

  const currentStepDef = wizard.steps[stepNumber];
  if (!currentStepDef) {
    return NextResponse.json({ error: 'Invalid step' }, { status: 400 });
  }

  const sessionData = session.session_data as Record<string, unknown>;

  // Step 4 multi-role: "Move to Education" — advance without AI call
  if (action === 'advance' && stepNumber === 3) {
    const roles = (sessionData.roles as string[] | undefined) || [];
    if (roles.length === 0) {
      return NextResponse.json({ error: 'No roles to advance' }, { status: 400 });
    }
    const completedSteps = (sessionData.completedSteps || []) as Array<Record<string, unknown>>;
    const experienceOutput = roles.join('\n\n');
    const stepResult = {
      stepNumber: 3,
      userInput: '',
      aiCoaching: '',
      finalOutput: experienceOutput,
      approved: true
    };
    const updatedSteps = [...completedSteps, stepResult];
    const updatedData = { ...sessionData, completedSteps: updatedSteps, roles };

    await supabase
      .from('tool_sessions')
      .update({
        current_step: 4,
        session_data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    return NextResponse.json({
      sessionId,
      currentStep: 4,
      totalSteps: wizard.totalSteps,
      aiCoaching: '',
      isComplete: false,
      allowAddMore: false,
      step: wizard.steps[4]
    });
  }

  // Build AI coaching prompt for this step
  const completedSteps = (sessionData.completedSteps || []) as Array<Record<string, unknown>>;

  const contextSummary = completedSteps.length > 0
    ? `COMPLETED STEPS SO FAR:\n${completedSteps.map((s: Record<string, unknown>) =>
        `Step ${s.stepNumber}: ${s.finalOutput}`
      ).join('\n\n')}\n\n`
    : '';

  const systemPrompt = `You are Melissa, an expert career coach running a guided résumé coaching session.

${contextSummary}${currentStepDef.systemPromptFragment}

Be specific, encouraging, and action-oriented. No generic advice. No walls of text.
Max 3-4 short paragraphs. Always end with a clear next instruction or question.`;

  // Call OpenAI
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      max_tokens: 800,
      stream: false
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'AI coaching failed' }, { status: 500 });
  }

  const data = await response.json();
  const aiCoaching = data.choices?.[0]?.message?.content || '';

  // Determine if this step is being approved (action === 'approve')
  const isApproving = action === 'approve';
  const isLastStep = stepNumber === wizard.totalSteps - 1;
  const isStep4 = stepNumber === 3; // Experience Bullets (0-indexed)

  if (isApproving) {
    const isStep6 = stepNumber === 5; // Final Review (0-indexed)
    let finalOutput: string;
    if (isStep6) {
      // Step 6: artifact is always assembled résumé, never user input ("Looks good")
      const extracted = extractApprovedContent(aiCoaching);
      finalOutput = extracted && extracted.length > 100
        ? trimIncompleteContent(extracted)
        : buildArtifact(wizard.toolName, completedSteps, sessionData);
    } else {
      const extracted = extractApprovedContent(aiCoaching);
      finalOutput = extracted ?? userInput;
    }

    const stepResult = {
      stepNumber,
      userInput,
      aiCoaching,
      finalOutput,
      approved: true
    };

    let updatedData: Record<string, unknown> = { ...sessionData };
    let updatedSteps = [...completedSteps];

    // Step 4 multi-role: append to roles array, do NOT advance
    if (isStep4 && !advanceToNextStep) {
      const roles = ((updatedData.roles as string[] | undefined) || []).concat(finalOutput);
      updatedData = { ...updatedData, roles };
      // Don't add to completedSteps yet; we add when user advances

      await supabase
        .from('tool_sessions')
        .update({
          session_data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      return NextResponse.json({
        sessionId,
        currentStep: stepNumber,
        totalSteps: wizard.totalSteps,
        aiCoaching,
        isComplete: false,
        allowAddMore: true,
        step: wizard.steps[stepNumber]
      });
    }

    updatedSteps = [...completedSteps, stepResult];
    const nextStep = stepNumber + 1;
    const isNowComplete = isLastStep;

    let artifact: string | undefined;
    if (isNowComplete) {
      artifact = isStep6 ? finalOutput : buildArtifact(wizard.toolName, updatedSteps, { ...updatedData, completedSteps: updatedSteps });
    }

    await supabase
      .from('tool_sessions')
      .update({
        current_step: isNowComplete ? stepNumber : nextStep,
        session_data: { ...updatedData, completedSteps: updatedSteps, artifact },
        status: isNowComplete ? 'completed' : 'active',
        updated_at: new Date().toISOString(),
        completed_at: isNowComplete ? new Date().toISOString() : null
      })
      .eq('id', sessionId);

    return NextResponse.json({
      sessionId,
      currentStep: isNowComplete ? stepNumber : nextStep,
      totalSteps: wizard.totalSteps,
      aiCoaching,
      isComplete: isNowComplete,
      allowAddMore: false,
      artifact,
      step: isNowComplete ? undefined : wizard.steps[nextStep]
    });
  }

  // Just submitted (not approving yet) — return AI coaching, keep on same step
  return NextResponse.json({
    sessionId,
    currentStep: stepNumber,
    totalSteps: wizard.totalSteps,
    aiCoaching,
    isComplete: false,
    step: currentStepDef
  });
}
