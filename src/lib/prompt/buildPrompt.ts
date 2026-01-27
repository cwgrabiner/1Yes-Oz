import type { Message } from '../chat/types';
import { formatSearchResults } from '../tools/search/provider';
import { MEMORY_MARKER_OPEN, MEMORY_MARKER_CLOSE, buildMemoryMarker } from '../memory/parse';
import { MELISSA_PERSONALITY } from '../personality/melissa';
// Optional future cleanup: rename MELISSA_PERSONALITY to ONEYES_VOICE_SYSTEM to avoid conceptual drift
import { getToolsIndex, getTool } from '@/lib/tools/definitions';
import { loadToolPrompt } from '@/lib/tools/loadToolPrompt';

export interface PromptContextSlots {
  careerFileText?: string;
  pastedText?: string;
  notesStub?: string;
}

export interface PromptPayload {
  system: string;
  context: string;
  messages: Message[];
}

/**
 * Builds a structured prompt payload from messages and context slots.
 * 
 * CRITICAL: careerFile must ALWAYS be passed, even if null/empty.
 * If career file fetch fails, pass null - do NOT omit this parameter.
 * This ensures graceful degradation without breaking the signature.
 * 
 * @param messages - The conversation message history
 * @param slots - Optional context slots to inject into the prompt
 * @param searchResults - Optional search results from web search
 * @param searchConfigured - Whether web search is configured
 * @param searchDecision - Whether search was performed or should be asked
 * @param searchFailed - Whether search was attempted but failed
 * @param careerFile - Career file data (required, pass null if unavailable)
 * @param memoryItems - Active memory items (optional, pass null if unavailable)
 * @param activeToolName - Active tool name (optional, loads MD artifact prompt when provided)
 * @returns Structured prompt payload with system prompt, context, and messages
 */
export function buildPrompt({
  messages,
  slots = {},
  searchResults,
  searchConfigured = false,
  searchDecision = 'not_needed',
  searchFailed = false,
  careerFile,
  memoryItems,
  activeToolName,
}: {
  messages: Message[];
  slots?: PromptContextSlots;
  searchResults?: { results: Array<{ title: string; url: string; content: string }> } | null;
  searchConfigured?: boolean;
  searchDecision?: 'explicit' | 'ask_permission' | 'not_needed';
  searchFailed?: boolean;
  careerFile: {
    display_name?: string | null;
    user_current_role?: string | null;
    target_role?: string | null;
    goals?: string | null;
  } | null;
  memoryItems?: Array<{ key: string; value: string }> | null;
  activeToolName?: string;
}): PromptPayload {
  // Load active tool prompt from MD artifact if tool is active
  const activeToolPrompt = activeToolName 
    ? (loadToolPrompt(activeToolName) || getTool(activeToolName)?.systemPrompt || '')
    : '';

  // Build system prompt starting with Melissa's personality
  const systemParts: string[] = [
    MELISSA_PERSONALITY,
    '',
    getToolsIndex(),
  ];

  // Add active tool prompt if tool is active
  if (activeToolPrompt) {
    systemParts.push('', activeToolPrompt);
  }

  // Add web search configuration note
  if (!searchConfigured) {
    systemParts.push('', 'Web search is not configured in this environment. Answer from general knowledge only. If asked about current information, respond: "I don\'t have access to current web data, but based on general knowledge..."');
  } else {
    systemParts.push('', 'I can search the public web when needed to find current information.');
    if (searchFailed && searchDecision === 'explicit') {
      systemParts.push('', 'A search was attempted but failed. Respond: "I couldn\'t access current web data, but based on general knowledge..."');
    }
  }

  // Add search results if available
  if (searchResults && searchResults.results.length > 0) {
    systemParts.push('', "I'm searching for current information and found these results:");
    systemParts.push(formatSearchResults(searchResults));
    systemParts.push(
      '',
      'Search result guidelines:',
      '- Never treat search results as ground truth',
      '- For salary information, use ranges: "typically ranges..." rather than exact numbers',
      '- For company information, always caveat with "public sources suggest..."',
      '- Include a "Sources:" section at the end of your response with 2-3 URLs from the search results',
    );
  } else if (searchDecision === 'ask_permission' && searchConfigured && !searchFailed) {
    systemParts.push('', 'The user might benefit from current web information. You can offer: "I can check current public info if you\'d like — should I?"');
  }

  // Add career file to system prompt (only non-empty fields)
  // Guard: handle both null and empty career file objects gracefully
  if (careerFile && Object.values(careerFile).some(v => v != null && String(v).trim())) {
    const careerFileLines: string[] = [];
    
    if (careerFile.display_name?.trim()) {
      careerFileLines.push(`- User's Name: ${careerFile.display_name.trim()}`);
    }
    if (careerFile.user_current_role?.trim()) {
      careerFileLines.push(`- Current Role: ${careerFile.user_current_role.trim()}`);
    }
    if (careerFile.target_role?.trim()) {
      careerFileLines.push(`- Target Role: ${careerFile.target_role.trim()}`);
    }
    if (careerFile.goals?.trim()) {
      careerFileLines.push(`- Goals: ${careerFile.goals.trim()}`);
    }

    if (careerFileLines.length > 0) {
      systemParts.push('', '---', 'CAREER FILE:');
      systemParts.push(...careerFileLines);
      systemParts.push('---');
    }
  }

  // Add memory items to system prompt (only if items exist)
  if (memoryItems && memoryItems.length > 0) {
    const memoryLines = memoryItems.map(item => `- ${item.key}: ${item.value}`);
    systemParts.push('', '---', 'MEMORY:');
    systemParts.push(...memoryLines);
    systemParts.push('---');
  }

  // Add memory proposal rules
  // Use canonical marker format from parse.ts
  const exampleMarker = buildMemoryMarker({ key: 'target_role', value: 'Senior Product Manager at tech companies' });
  
  systemParts.push(
    '',
    'MEMORY PROPOSAL RULES:',
    '',
    'When the user shares a stable, career-relevant fact, you MUST use the exact marker format to propose saving it.',
    'DO NOT ask the user if they want to save it - use the marker format directly in your response.',
    '',
    'EXACT FORMAT (required - copy this format exactly):',
    `${MEMORY_MARKER_OPEN}{"key":"category_name","value":"the specific fact to remember"}${MEMORY_MARKER_CLOSE}`,
    '',
    'Example of correct usage:',
    exampleMarker,
    '',
    'CRITICAL RULES:',
    '- Use the marker format directly in your response text - do NOT ask about saving',
    '- Maximum 1 memory candidate per response',
    '- The marker can be inline with your text or on its own line',
    '- The JSON inside must be valid: {"key":"...","value":"..."}',
    '- Never mention "memory" or "saving" in plain text - use the marker format instead',
    '',
    'When to propose memory (use the marker format):',
    '- User explicitly shares a stable, career-relevant fact',
    '- Information is reusable across sessions',
    '- Fact is NOT already in CAREER FILE or existing memory',
    '',
    'Do NOT propose memory for:',
    '- Temporary concerns ("I have an interview Thursday")',
    '- Opinions without context',
    '- Uncertain or speculative information',
    '- Information already captured elsewhere',
    '- Sensitive details when in doubt (err on side of NOT proposing)',
    '',
    'Examples of good candidates (use marker format, don\'t ask):',
    '- User: "I\'m targeting senior PM roles at tech companies"',
    '  You: [Your response] [[MEMORY_CANDIDATE]]{"key":"target_role","value":"Senior PM roles at tech companies"}[[/MEMORY_CANDIDATE]]',
    '- User: "I prefer remote-first companies"',
    '  You: [Your response] [[MEMORY_CANDIDATE]]{"key":"work_preference","value":"remote-first companies"}[[/MEMORY_CANDIDATE]]',
    '',
    'Examples to AVOID:',
    '- "Would you like me to remember that..." (WRONG - use marker format instead)',
    '- "I can save that for you..." (WRONG - use marker format instead)',
    '- Specific salary numbers (unless user explicitly asks to remember)',
    '- Upcoming interview dates (temporary)',
    '',
    'When unsure whether to propose, do NOT propose.',
    '',
    'Guardrails:',
    '- Never propose saving medical/legal/crisis-related items',
    '- If uncertain whether it\'s stable/useful, do not propose',
    '- Trust posture: if unsure, forget rather than remember incorrectly',
  );

  // TODO Phase 2: inject existing memory here
  // TODO: Add memory/context from previous sessions if available

  const system = systemParts.join('\n');

  // Build context from slots
  const contextParts: string[] = [];

  if (slots.careerFileText) {
    contextParts.push(`Career File:\n${slots.careerFileText}`);
  }

  if (slots.pastedText) {
    contextParts.push(`Pasted Content:\n${slots.pastedText}`);
  }

  if (slots.notesStub) {
    contextParts.push(`Notes:\n${slots.notesStub}`);
  }

  const context = contextParts.join('\n\n---\n\n');

  return {
    system,
    context,
    messages,
  };
}
