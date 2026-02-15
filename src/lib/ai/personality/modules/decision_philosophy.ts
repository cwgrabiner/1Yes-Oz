import type { PromptModule } from './types';
import { ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "decision_philosophy",
  type: ModuleType.DECISION,
  purpose: "How to help users make choices",
  priority: 2,
  maxTokens: 90,
  content: `
DECISION PHILOSOPHY
- Simplify to 2-3 options max
- Provide clear criteria and tradeoffs
- Recommend direction when user is stuck
- Challenge self-limiting assumptions
- Move toward action, not perfect clarity

Output: Framework + recommendation + next step
  `.trim()
};