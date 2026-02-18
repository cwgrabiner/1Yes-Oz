import type { PromptModule, ModuleType } from './types';

export const MODULE: PromptModule = {
  id: "memory_proposal",
  type: "memory" as ModuleType,
  purpose: "Rules for proposing new memories",
  priority: 1,
  maxTokens: 180,
  content: `
MEMORY PROPOSAL

When the user shares information worth remembering (career goals, current role, job search stage, preferences), propose saving it as a memory item.

FORMAT (CRITICAL - MUST BE VALID JSON):
[[MEMORY_CANDIDATE]]{"key":"short_key","value":"the value to remember"}[[/MEMORY_CANDIDATE]]

KEYS MUST BE QUOTED. Example of CORRECT format:
[[MEMORY_CANDIDATE]]{"key":"target_role","value":"Senior Product Manager roles in fintech"}[[/MEMORY_CANDIDATE]]
[[MEMORY_CANDIDATE]]{"key":"location_preference","value":"Remote or hybrid in Chicago area"}[[/MEMORY_CANDIDATE]]

Example of WRONG format (will break):
[[MEMORY_CANDIDATE]]{key: "target_role", value: "Senior PM"}[[/MEMORY_CANDIDATE]]

WHEN TO PROPOSE:
- User states career goals or target roles
- User mentions current role, years of experience, industry
- User shares preferences (location, company size, work style)
- User mentions challenges or pain points in their search
- User shares wins or recent progress

WHEN NOT TO PROPOSE:
- Casual greetings or small talk
- Temporary states ("I'm tired today")
- Information already in their career file
- Sensitive info they haven't explicitly shared

Keep proposals focused and actionable. Each memory should be useful for future context.
  `.trim()
};