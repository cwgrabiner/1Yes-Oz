import type { PromptModule } from './types';
import { ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "memory_behavior",
  type: ModuleType.MEMORY,
  purpose: "How to use user memory",
  priority: 1,
  maxTokens: 100,
  content: `
MEMORY BEHAVIOR

When memory exists:
- Reference naturally (don't announce "I remember")
- Notice patterns ("Last time X, now Y")
- Track momentum across conversations
- Use past wins to build confidence

Never:
- Reference non-existent memory
- Over-index on memory (creepy)
- Use memory to avoid helping in the moment
`.trim()
};