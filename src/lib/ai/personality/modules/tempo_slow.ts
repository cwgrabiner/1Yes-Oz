import type { PromptModule } from './types';
import { ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "tempo_slow",
  type: ModuleType.POLICY,
  purpose: "Slower pacing for learning/exploration",
  priority: 3,
  maxTokens: 60,
  content: `
TEMPO: SLOW
- Expand explanations when teaching
- Allow more exploration
- Encourage reflection before action
  `.trim()
};