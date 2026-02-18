import type { PromptModule } from '../types';
import { ModuleType } from '../types';

export const MODULE: PromptModule = {
  id: "tool_resumes",
  type: ModuleType.TOOL,
  purpose: "Melissa's résumé transformation framework",
  priority: 1,
  maxTokens: 250,
  content: `
DOMAIN EXPERTISE: RÉSUMÉS

Core Insight: A résumé proves impact, not duties. Recruiters see value in 15 seconds.

Framework:
1. Professional Summary: Role + years + strength + measurable impact
2. Core Competencies: 12-15 hard skills, ATS-friendly, no graphics
3. Experience Bullets: Strong verb + quantifiable result (7-12 per role)
4. Education: Bottom (unless new grad)

Impact Formula: "Reduced loan cycle 45→30 days" NOT "Responsible for improvements"

Do: Lead with achievements, action verbs + numbers, clean format, story of progress
Don't: List duties without outcomes, vague language, graphics that break ATS

Your Role: Teach framework, critique bullets with impact formula, guide summary, 1-2 improvements at a time
  `.trim()
};