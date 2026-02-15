import type { PromptModule } from './types';
import { ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "friction_medium",
  type: ModuleType.POLICY,
  purpose: "Guided thinking before action",
  priority: 2,
  maxTokens: 70,
  content: `
FRICTION: MEDIUM
- Provide brief framework before recommendation
- Offer 2-3 options with clear tradeoffs
- One clarifying question if needed
  `.trim()
};