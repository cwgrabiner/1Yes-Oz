import type { Domain, Stage } from './types';

export interface RawChunk {
  content: string;
  domain: Domain;
  stage?: Stage;
  metadata?: {
    source?: string;
    section?: string;
    tags?: string[];
  };
}

export const SAMPLE_CHUNKS: RawChunk[] = [
  // INTERVIEW DOMAIN
  {
    domain: "interview",
    stage: "interviewing",
    content: `Interview Prep Checklist (The Night Before):
1. Pick 3 stories: one challenge you overcame, one win, one growth moment
2. Practice "tell me about yourself" out loud once (not more)
3. Prep 2 questions to ask them
4. Research: company recent news + interviewer's LinkedIn

Don't overdo it. Sleep matters more than perfect prep.`,
    metadata: {
      source: "melissa_frameworks",
      section: "interview_prep",
      tags: ["preparation", "anxiety", "checklist"]
    }
  },
  {
    domain: "interview",
    stage: "interviewing",
    content: `STAR Method Framework:
Situation: 1-2 sentences of context
Task: What you needed to accomplish
Action: What YOU specifically did (focus here)
Result: Quantified outcome + what you learned

Common mistake: Spending too much time on situation/task. Get to action fast.`,
    metadata: {
      source: "melissa_frameworks",
      section: "behavioral_interviews",
      tags: ["STAR", "storytelling", "behavioral"]
    }
  },
  {
    domain: "interview",
    stage: "interviewing",
    content: `"Tell Me About Yourself" Structure:
1. Now: Current role + key win (30 sec)
2. How: 1-2 past roles that led here (30 sec)
3. Why: Why this role/company excites you (15 sec)

Total: 75 seconds. Practice with a timer. Most people ramble for 5 minutes.`,
    metadata: {
      source: "melissa_frameworks",
      section: "common_questions",
      tags: ["tell_me_about_yourself", "intro"]
    }
  },

  // RESUME DOMAIN
  {
    domain: "resume",
    stage: "applying",
    content: `Resume Bullet Formula:
[Action Verb] + [What You Did] + [How/Why It Mattered] + [Result]

Example:
Bad: "Responsible for managing team projects"
Good: "Led 5-person sprint team to deliver redesign 2 weeks early, increasing user engagement 40%"

Every bullet needs a result. No responsibilities, only accomplishments.`,
    metadata: {
      source: "melissa_frameworks",
      section: "resume_bullets",
      tags: ["bullets", "results", "quantification"]
    }
  },
  {
    domain: "resume",
    stage: "applying",
    content: `ATS (Applicant Tracking System) Rules:
1. Use standard section headers: Experience, Education, Skills
2. Don't use tables, text boxes, or fancy formatting
3. Mirror keywords from job description (exact phrases)
4. PDF is fine (contrary to old advice)
5. One page for <10 years experience, two pages for 10+

Most ATS failures are formatting, not content.`,
    metadata: {
      source: "melissa_frameworks",
      section: "ats_optimization",
      tags: ["ATS", "formatting", "keywords"]
    }
  },

  // NETWORKING DOMAIN
  {
    domain: "networking",
    stage: "applying",
    content: `Networking = Helpful Conversations (Not Asking for Favors)

Formula for coffee chat outreach:
"Hi [Name], I'm exploring [role type]. Would you share 15 min on how you got there?"

That's it. No need to "be good at networking"—just be curious.

Show up with 3 good questions. Follow up with thank you + one insight you gained.`,
    metadata: {
      source: "melissa_frameworks",
      section: "networking_framework",
      tags: ["coffee_chat", "outreach", "informational"]
    }
  },
  {
    domain: "networking",
    stage: "applying",
    content: `LinkedIn Referral Request Template:

"Hi [Name],

I saw you work at [Company] as a [Role]. I'm currently exploring [type of role] opportunities and [Company] is at the top of my list.

Would you be open to a quick chat about your experience there? I'd also love to learn more about [specific team/project if known].

I know referrals can be helpful—happy to share my background if it makes sense.

Thanks for considering,
[Your name]"

Adjust the [brackets] to personalize. Send when ready.`,
    metadata: {
      source: "melissa_templates",
      section: "referral_requests",
      tags: ["referral", "linkedin", "template"]
    }
  },

  // NEGOTIATION DOMAIN
  {
    domain: "negotiation",
    stage: "negotiating",
    content: `Offer Evaluation Framework:

Forget "keep interviewing." You have options in hand—decide between them.

Key question: Which offer gets you closer to your 3-year goal?

If you don't have a 3-year goal, use this: Which role builds skills you don't have yet?

Culture vs Comp tradeoff: If the culture gap is real (not just "nice people"), take that offer. You can negotiate comp later. Bad culture is expensive.`,
    metadata: {
      source: "melissa_frameworks",
      section: "offer_evaluation",
      tags: ["decision", "tradeoffs", "culture"]
    }
  },
  {
    domain: "negotiation",
    stage: "negotiating",
    content: `Counter-Offer Strategy:

1. Always negotiate. Even if you'll accept, say: "I'm excited. Can we discuss comp?"
2. Anchor high (10-20% above their offer)
3. Have 3 asks ready: base, equity, sign-on bonus, start date, title, remote flex
4. If they say no to one, pivot to another
5. Get everything in writing before accepting

Never accept the first offer without discussion. It signals you undervalue yourself.`,
    metadata: {
      source: "melissa_frameworks",
      section: "negotiation_tactics",
      tags: ["counter", "strategy", "anchoring"]
    }
  },

  // LINKEDIN DOMAIN
  {
    domain: "linkedin",
    stage: "applying",
    content: `LinkedIn Headline Formula:

Bad: "Product Manager at Company"
Good: "Product Manager | Building AI tools that reduce user churn | Ex-Google, Ex-Startup"

Structure: [Title] | [Value you create] | [Credibility signals]

Your headline shows in search results. Make it searchable and compelling.`,
    metadata: {
      source: "melissa_frameworks",
      section: "linkedin_optimization",
      tags: ["headline", "positioning", "search"]
    }
  },
  {
    domain: "linkedin",
    stage: "applying",
    content: `LinkedIn About Section Structure:

Paragraph 1: What you do now + why it matters
Paragraph 2: How you got here (1-2 key transitions)
Paragraph 3: What you're looking for + call to action

Keep it under 200 words. Write like you talk. End with "Open to: [what you want]"

This isn't a resume. It's a conversation starter.`,
    metadata: {
      source: "melissa_frameworks",
      section: "about_section",
      tags: ["about", "summary", "positioning"]
    }
  },

  // CONFIDENCE DOMAIN
  {
    domain: "confidence",
    content: `Rejection is Data, Not Verdict:

Every "no" teaches you something:
- Wrong role fit → refine target
- Interview didn't land → practice storytelling
- Resume didn't pass → optimize keywords

Track patterns in rejection. That's where the learning is.

You're not "bad at this." You're learning a new skill. Reps matter more than perfection.`,
    metadata: {
      source: "melissa_pov",
      section: "reframing_rejection",
      tags: ["mindset", "rejection", "growth"]
    }
  },
  {
    domain: "confidence",
    content: `Momentum Beats Perfection:

Waiting for the perfect resume/LinkedIn/cover letter is stalling disguised as preparation.

Done is better than perfect. Send the 80% version. You'll learn more from 5 real applications than 5 hours of tweaking.

Confidence follows action, not the other way around. Act first, feel ready later.`,
    metadata: {
      source: "melissa_pov",
      section: "action_over_perfection",
      tags: ["momentum", "confidence", "action"]
    }
  }
];