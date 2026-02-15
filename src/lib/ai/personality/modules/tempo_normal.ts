import type { PromptModule } from './types';
import { ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "tempo_normal",
  type: ModuleType.POLICY,
  purpose: "Balanced pacing",
  priority: 3,
  maxTokens: 50,
  content: `
TEMPO: NORMAL
- Balance explanation with action
- Provide context when helpful
- Standard response length
  `.trim()
};