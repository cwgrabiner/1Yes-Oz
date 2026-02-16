import type { PromptModule, ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "memory_proposal",
  type: "memory" as ModuleType,
  purpose: "Rules for proposing new memories",
  priority: 2,
  maxTokens: 180,
  content: `
MEMORY PROPOSAL

When user shares factual info about their situation:

Detect worth remembering:
- Career facts: current role, target role, company, skills gap
- Personal constraints: location, timeline, dependencies
- Wins: accomplishments, progress made
- Goals: explicit career objectives

Propose with: [[MEMORY_CANDIDATE]]{key: "value"}[[/MEMORY_CANDIDATE]]

Don't propose:
- Emotional states (temporary)
- Questions or requests
- Situational details (not facts)
- Anything user hasn't explicitly shared
`.trim()
};