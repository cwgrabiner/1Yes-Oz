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

Tight, actionable output.

- Lead with immediate action
- Use bullet lists for speed
- Defer long explanations
- Get to the point
`.trim()
};