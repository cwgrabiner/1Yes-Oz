import { routeTurn } from './router';
import { assemblePrompt } from './assembler';
import { retrieveContext } from './retrieval';
import type { RouterState } from './router/types';
import type { Message } from '../chat/types';
import { getTool } from '../tools/definitions';
import { loadToolPrompt } from '../tools/loadToolPrompt';

interface GeneratePromptInput {
  userText: string;
  prevState?: RouterState;
  memorySummary?: string;
  conversationHistory?: Message[];
  toolsIndex?: string;
  activeToolPrompt?: string;
  webSearchConfig?: string;
  webSearchResults?: string;
}

interface GeneratePromptOutput {
  systemPrompt: string;
  nextState: RouterState;
  activeTool?: string;
  wizardOffer?: string;
  telemetry: {
    posture: string;
    priority: string;
    domain: string;
    stage: string;
    urgency: string;
    friction: string;
    modulesIncluded: string[];
    tokensUsed: number;
    modulesDropped: string[];
    retrievalQuery?: string;
    chunksRetrieved?: number;
  };
}

/**
 * Main orchestrator: routes turn, retrieves context, assembles prompt
 * 
 * This is what the API route calls instead of buildPrompt()
 */
export async function generatePrompt(input: GeneratePromptInput): Promise<GeneratePromptOutput> {
  const { userText, prevState, memorySummary, conversationHistory, toolsIndex, activeToolPrompt, webSearchConfig, webSearchResults } = input;

  // 1. Route the turn
  const turnCount = conversationHistory
    ? Math.max(0, conversationHistory.filter((m) => m.role === 'user').length - 1)
    : 0;
  const routerOutput = routeTurn({
    userText,
    prevState,
    memorySummary,
    turnCount
  });

  const { nextState, moduleIds, retrievalQuery, activeTool: routerActiveTool, wizardOffer } = routerOutput;

  // Always include melissa_authority (invariant; router is protected, so we add here)
  const moduleIdsToUse = moduleIds.includes('melissa_authority') ? moduleIds : [...moduleIds, 'melissa_authority'];

  // Use router-recommended tool when client didn't send one
  const effectiveActiveToolPrompt = activeToolPrompt ?? (routerActiveTool ? (loadToolPrompt(routerActiveTool) || getTool(routerActiveTool)?.systemPrompt || '') : undefined);

  // 2. Retrieve domain context (skip when tool module already has domain expertise)
  let retrievedChunk: string | undefined;
  let chunksRetrieved = 0;

  const hasToolModule = moduleIds.some((id) => id.startsWith('tool_'));

  if (retrievalQuery && nextState.domain !== 'general' && !hasToolModule) {
    const results = await retrieveContext(retrievalQuery, nextState.domain);

    if (results.length > 0) {
      retrievedChunk = results
        .map((r) => r.content)
        .join('\n\n---\n\n');
      chunksRetrieved = results.length;
    }
  }

  // 3. Assemble system prompt
  const assembled = assemblePrompt({
    moduleIds: moduleIdsToUse,
    memorySummary,
    retrievedChunk, // Now actually populated with domain expertise
    toolsIndex,
    activeToolPrompt: effectiveActiveToolPrompt,
    webSearchConfig,
    webSearchResults
  });

  // 4. Return prompt + state + telemetry
  return {
    systemPrompt: assembled.systemPrompt,
    nextState,
    ...(routerActiveTool && { activeTool: routerActiveTool }),
    ...(wizardOffer && { wizardOffer }),
    telemetry: {
      posture: nextState.posture,
      priority: nextState.priority,
      domain: nextState.domain,
      stage: nextState.stage,
      urgency: nextState.urgency,
      friction: nextState.friction,
      modulesIncluded: assembled.modulesIncluded,
      tokensUsed: assembled.tokensUsed,
      modulesDropped: assembled.modulesDropped,
      retrievalQuery,
      chunksRetrieved
    }
  };
}