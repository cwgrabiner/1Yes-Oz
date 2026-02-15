import type { PromptModule } from './types';
import { ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "tempo_fast",
  type: ModuleType.POLICY,
  purpose: "Fast pacing for high urgency",
  priority: 2,
  maxTokens: 60,
  content: `
TEMPO: FAST
- Keep output tight and actionable
- Lead with immediate next action
- Use bullet lists to reduce time-to-act
- Defer long explanations
  `.trim()
};