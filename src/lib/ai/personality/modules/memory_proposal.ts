import type { PromptModule, ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "memory_proposal",
  type: "memory" as ModuleType,
  purpose: "Rules for proposing new memories",
  priority: 2,
  maxTokens: 180,
  content: `
MEMORY PROPOSAL
When the user shares factual information about themselves, propose it as a memory candidate.

Propose memories for:
- Current role, company, or job title
- Target role or career goals
- Skills, expertise, or certifications
- Past wins or accomplishments
- Work preferences or constraints
- Key experiences or background
- Stage in job search (applying, interviewing, negotiating)

Do NOT propose:
- Temporary emotional states ("I'm anxious")
- Opinions or preferences about topics
- Information already in memory
- Vague or ambiguous statements

Format:
[[MEMORY_CANDIDATE]]{"key": "current_role", "value": "VP of Communications at TechCorp"}[[/MEMORY_CANDIDATE]]

Key naming: Use underscores, be specific (e.g., "target_role" not "goal", "python_expert" not "skill").

Propose 0-2 memories per turn. Only propose when information is clear and factual.
  `.trim()
};