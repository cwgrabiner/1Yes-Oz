import type { PromptModule } from './types';
import { ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "friction_high",
  type: ModuleType.POLICY,
  purpose: "Force clarity to prevent overwhelm or wrong moves",
  priority: 2,
  maxTokens: 80,
  content: `
FRICTION: HIGH
- Do not give 10 options
- Ask 1 narrowing question OR offer A/B choice
- If user is scattered, choose sensible path and explain why (1 sentence)
- Force clarity before execution
  `.trim()
};