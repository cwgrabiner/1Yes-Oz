import { routeTurn } from './router';
import { assemblePrompt } from './assembler';
import { retrieveContext } from './retrieval';
import type { RouterState } from './router/types';
import type { Message } from '../chat/types';

interface GeneratePromptInput {
  userText: string;
  prevState?: RouterState;
  memorySummary?: string;
  conversationHistory?: Message[];
}

interface GeneratePromptOutput {
  systemPrompt: string;
  nextState: RouterState;
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
  const { userText, prevState, memorySummary } = input;

  // 1. Route the turn
  const routerOutput = routeTurn({
    userText,
    prevState,
    memorySummary
  });

  const { nextState, moduleIds, retrievalQuery } = routerOutput;

  // 2. Retrieve domain context (NEW - Week 3)
  let retrievedChunk: string | undefined;
  let chunksRetrieved = 0;

  if (retrievalQuery && nextState.domain !== 'general') {
    const results = await retrieveContext(retrievalQuery, nextState.domain);
    
    if (results.length > 0) {
      retrievedChunk = results
        .map(r => r.content)
        .join('\n\n---\n\n');
      chunksRetrieved = results.length;
    }
  }

  // 3. Assemble system prompt
  const assembled = assemblePrompt({
    moduleIds,
    memorySummary,
    retrievedChunk // Now actually populated with domain expertise
  });

  // 4. Return prompt + state + telemetry
  return {
    systemPrompt: assembled.systemPrompt,
    nextState,
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