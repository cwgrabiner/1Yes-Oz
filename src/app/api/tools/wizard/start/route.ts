import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getWizard } from '@/lib/wizard/registry';
import type { WizardStartRequest } from '@/lib/wizard/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as WizardStartRequest & { forceNew?: boolean };
  const { toolName, initialContext, forceNew } = body;

  const wizard = getWizard(toolName);
  if (!wizard) return NextResponse.json({ error: `No wizard for tool: ${toolName}` }, { status: 400 });

  // Check for existing active session
  const { data: existing } = await supabase
    .from('tool_sessions')
    .select('id, current_step')
    .eq('user_id', user.id)
    .eq('tool_name', toolName)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing && !forceNew) {
    return NextResponse.json({
      sessionId: existing.id,
      currentStep: existing.current_step,
      totalSteps: wizard.totalSteps,
      resumed: true,
      hasExistingSession: true,
      step: wizard.steps[existing.current_step]
    });
  }

  if (existing && forceNew) {
    await supabase
      .from('tool_sessions')
      .update({ status: 'abandoned', updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  }

  // Create new session
  const sessionData: Record<string, unknown> = {};
  if (initialContext) {
    sessionData.initialContext = initialContext;
  }

  const { data: session, error } = await supabase
    .from('tool_sessions')
    .insert({
      user_id: user.id,
      tool_name: toolName,
      current_step: 0,
      total_steps: wizard.totalSteps,
      session_data: sessionData,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create wizard session:', error);
    return NextResponse.json({ error: 'Failed to start wizard' }, { status: 500 });
  }

  return NextResponse.json({
    sessionId: session.id,
    currentStep: 0,
    totalSteps: wizard.totalSteps,
    resumed: false,
    hasExistingSession: false,
    step: wizard.steps[0]
  });
}
