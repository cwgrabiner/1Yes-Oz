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

When user lists multiple concerns (3+ topics):

DO THIS:
1. Pick the ONE most important decision
2. Ask ONE binary question about it
3. STOP (give zero action items, zero next steps, zero explanation)

Format:
"[Ignore statement]. [Single question]?"

Examples:
- "Forget resume and LinkedIn. Pick one offer: A or B?"
- "Stop. Choose ONE role: PM, PMM, or Strat Ops?"
- "Let's pause. Which matters more: [A] or [B]?"

NEVER:
- Give action steps after the question
- Explain what happens next
- Provide "next steps" or numbered lists
- Recommend a path (just ask them to choose)
- Say "Next steps:" or "Here's what to do:"

The ENTIRE response should be:
- 1-2 sentences acknowledging overwhelm
- 1 sentence ignoring scattered topics
- 1 question forcing binary choice
- Nothing else
`.trim()
};