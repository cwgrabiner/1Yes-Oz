import type { WizardDefinition } from '../types';

export const RESUME_WIZARD: WizardDefinition = {
  toolName: 'resumes',
  displayName: 'Résumé Makeover',
  totalSteps: 6,
  steps: [
    {
      stepNumber: 1,
      title: 'Paste Your Current Résumé',
      instruction: `*This tool is based on Melissa Grabiner's proven résumé methodology, refined over many years of coaching and hiring countless job seekers around the world.*

Let's start with what you have. Paste your current résumé below (or type "starting from scratch" if you don't have one yet).

I'll analyze it, tell you what's already working, and map out exactly what we're going to fix together.`,
      inputType: 'textarea',
      inputLabel: 'Your current résumé',
      inputPlaceholder: 'Paste your résumé here, or type "starting from scratch"...',
      systemPromptFragment: `WIZARD STEP 1: RÉSUMÉ ANALYSIS
The user has pasted their current résumé or is starting fresh. Your job:
1. If they pasted a résumé: identify 2-3 specific strengths to celebrate and 3 concrete improvement areas
2. If starting fresh: warmly acknowledge and gather current role/background
3. Preview the 6-step journey ahead
4. End with: "Ready to start? Let's write your Professional Summary first."
Be encouraging but specific. No generic praise. Find real strengths.`
    },
    {
      stepNumber: 2,
      title: 'Professional Summary',
      instruction: `Your Professional Summary is the most important 3-4 sentences on your résumé. It's the first thing recruiters read, and it needs to land fast.

**Melissa's formula:**
> [Role] + [Years] + [Core Strength] + [Biggest Impact]

**Example:**
> "Finance leader with 15+ years driving operational efficiency and reducing loan processing times by 30% across multi-site teams."

Write your draft below. Don't overthink it — we'll refine it together.`,
      inputType: 'textarea',
      inputLabel: 'Your Professional Summary draft',
      inputPlaceholder: 'Write your Professional Summary draft here...',
      systemPromptFragment: `WIZARD STEP 2: PROFESSIONAL SUMMARY COACHING
The user has written a Professional Summary draft. Your job:
1. Identify what's working (1-2 specifics)
2. Point out the single most important improvement (too vague, missing metrics, weak verbs, too long)
3. Rewrite it using Melissa's formula: [Role] + [Years] + [Core Strength] + [Biggest Impact]
4. Show the before/after comparison
5. Ask: "Does this feel like you? If yes, we'll lock it in and move to Core Competencies. If you want to tweak it, go ahead."
Keep your rewrite to 3-4 sentences max. Lead with strong verbs. Quantify where possible.
CRITICAL: End your response with ---APPROVED_CONTENT--- on its own line, then the exact Professional Summary text (3-4 sentences, copy-paste ready), then ---END--- on its own line.`
    },
    {
      stepNumber: 3,
      title: 'Core Competencies',
      instruction: `Core Competencies is a clean list of 12-15 hard skills that lives right under your Professional Summary.

**Melissa's rules:**
- Hard skills only (no "communication" or "leadership")
- ATS-friendly plain text (no charts, sidebars, or boxes)
- Match keywords from job descriptions you're targeting

**Examples of good ones:**
Financial Modeling | P&L Management | SQL & Python | Cross-functional Leadership | Vendor Negotiations

List your top skills below. Aim for 12-15.`,
      inputType: 'textarea',
      inputLabel: 'Your Core Competencies list',
      inputPlaceholder: 'List your skills here, one per line or separated by commas...',
      systemPromptFragment: `WIZARD STEP 3: CORE COMPETENCIES COACHING
The user has listed their skills. Your job:
1. Remove any soft/vague skills (leadership, communication, detail-oriented)
2. Suggest 2-3 additions based on their role/background that they may have missed
3. Format the final list cleanly: 12-15 hard skills, separated by " | "
4. Flag any skills that need to be more specific (e.g., "data analysis" → "SQL, Tableau, Looker")
5. Output the final formatted list
Ask: "Does this list feel complete? Anything to add or swap?" then lock it in.
CRITICAL: End your response with ---APPROVED_CONTENT--- on its own line, then the exact formatted skills list (12-15 hard skills separated by " | "), then ---END--- on its own line.`
    },
    {
      stepNumber: 4,
      title: 'Experience Bullets',
      instruction: `This is where most résumés fall apart. Bullet points that describe duties instead of impact.

**Melissa's formula:**
> [Strong verb] + [what you did] + [measurable result]

**Before:** "Responsible for improving loan processing."
**After:** "Reduced loan processing time from 45 to 30 days, cutting costs by 18%."

**For each role, we need 7-10 bullets with:**
- The most impactful achievements first
- Metrics wherever possible (%, $, days, people, scale)
- Strong verbs (Led, Built, Reduced, Grew, Launched, Negotiated...)

Add one role at a time. You can add 2-5 positions total. Start with your most recent role below.`,
      inputType: 'textarea',
      inputLabel: 'Your experience bullets for this role',
      inputPlaceholder: 'Include role title, dates, and paste current bullets or describe your top 3-5 achievements...',
      systemPromptFragment: `WIZARD STEP 4: EXPERIENCE BULLETS COACHING (SINGLE ROLE)

The user has shared one role's experience bullets. Your job:

1. Identify which bullets are duty-based vs. impact-based
2. Rewrite the weakest 3-5 bullets using Melissa's formula: [Strong verb] + [action] + [measurable result]
3. Present the rewrites in a clean, copy-ready format

CRITICAL FORMAT RULES:
- Do NOT create "Before/After" comparisons
- Do NOT number your rewrites as "1. Before: X / After: Y"
- Do NOT create structured breakdowns with headers like "### Duty-based vs. Impact-based"
- Just provide the improved bullets in a clean list, ready to copy

OUTPUT FORMAT:
---APPROVED_CONTENT---

**[Role Title]**
[Company Name] — [Dates]
- [Rewritten bullet 1]
- [Rewritten bullet 2]
- [Rewritten bullet 3]
- [Rewritten bullet 4]
- [Rewritten bullet 5]

---END---

Then ask: "Would you like to add another role, or move to Education?"

Keep your response tight. Strong verbs. Specific numbers. No "responsible for."`
    },
    {
      stepNumber: 5,
      title: 'Education & Formatting',
      instruction: `Almost done. Two quick things:

**Education placement:**
- Experienced professionals: education goes at the bottom
- New grads (0-2 years): education can go near the top
- Never list an incomplete degree — omit it or phrase carefully

**Formatting rules:**
- One column layout
- Clean fonts (no decorative fonts)
- No boxes, graphs, emojis, or color blocks — ATS can't read them
- Clear section headers: Professional Summary | Core Competencies | Experience | Education

Share your education section below and tell me if there are any formatting issues on your résumé I should know about.`,
      inputType: 'textarea',
      inputLabel: 'Your education section + any formatting notes',
      inputPlaceholder: 'Paste your education info and describe any formatting issues...',
      systemPromptFragment: `WIZARD STEP 5: EDUCATION & FORMATTING
The user has shared their education info and formatting situation. Your job:
1. Confirm education placement (bottom for experienced, top for new grads)
2. Handle any tricky situations (incomplete degree, gaps, non-traditional background) with Melissa's approach: omit incomplete degrees, phrase carefully
3. Flag any ATS-dangerous formatting elements they mentioned
4. Give a clean formatted education section
5. Confirm the overall structure is correct: Summary → Competencies → Experience → Education.
Tell them: "You're one step away from a finished résumé. Let's do the final review."
CRITICAL: End your response with ---APPROVED_CONTENT--- on its own line, then the exact formatted education section (school, degree, dates), then ---END--- on its own line.`
    },
    {
      stepNumber: 6,
      title: 'Final Review & Export',
      instruction: `You did it. Let's put it all together.

Click Submit below to generate your finished résumé — every section we worked through. Read it through once. If anything needs a final tweak, tell me. Otherwise, copy it and paste it into Word or Google Docs.

**One last thing Melissa always says:**
> "Your résumé is not your worth. It's a marketing tool designed to get you one thing — a conversation."

You're ready. Let's get you that conversation.`,
      inputType: 'textarea',
      inputLabel: 'Final notes or tweaks (or type "looks good" to finish)',
      inputPlaceholder: 'Any final changes, or type "looks good" to get your finished résumé...',
      systemPromptFragment: `WIZARD STEP 6: FINAL ASSEMBLY & EXPORT
This is the final step. Your job:
1. Assemble the complete résumé from all approved steps: Summary, Core Competencies, Experience bullets, Education
2. Format it cleanly as plain text, ready to copy into Word/Google Docs
3. If user requests final tweaks, make them
4. Add Melissa's closing message about the résumé being a marketing tool, not their worth
5. Output the FULL RÉSUMÉ in plain text format
6. End with: "Copy this, paste it into Word or Google Docs, and you're ready to send. You've got this."
Format sections clearly: use ALL CAPS headers and line breaks. Make it immediately usable.
CRITICAL: End your response with ---APPROVED_CONTENT--- on its own line, then the COMPLETE résumé (Professional Summary, Core Competencies, Experience, Education in that order, with clear section headers), then ---END--- on its own line. This is what will be saved.`
    }
  ]
};
