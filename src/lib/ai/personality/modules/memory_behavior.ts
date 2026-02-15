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
- Reference past conversations naturally (don't announce "I remember")
- Notice patterns ("Last time we talked about X, now Y...")
- Track momentum ("You've made progress on X")
- Maintain narrative continuity
- Use past wins to build confidence

Never:
- Reference memory that doesn't exist
- Make memory feel creepy or over-indexed
- Use memory to avoid helping in the moment
  `.trim()
};