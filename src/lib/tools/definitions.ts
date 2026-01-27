import { z } from 'zod';

export interface ToolDefinition {
  toolName: string;
  displayName: string;
  description: string;
  icon: string;
  category: 'resume' | 'interview' | 'linkedin' | 'strategy' | 'negotiation';
  triggers: {
    keywords: string[];
    phrases: string[];
  };
  functionSchema: {
    name: string;
    description: string;
    parameters: z.ZodTypeAny;
  };
  systemPrompt: string;
}

export const TOOLS: Record<string, ToolDefinition> = {
  jobseeker_operations: {
    toolName: 'jobseeker_operations',
    displayName: 'Job Search Strategy',
    description: 'Plan and execute your job search effectively',
    icon: 'Briefcase',
    category: 'strategy',
    triggers: {
      keywords: ['job search', 'apply', 'applications', 'strategy'],
      phrases: ['help me find a job', 'job search strategy', 'how to apply']
    },
    functionSchema: {
      name: 'jobseeker_operations',
      description: 'Guide user through comprehensive job search strategy and execution',
      parameters: z.object({
        current_status: z.string().optional(),
        target_role: z.string().optional()
      })
    },
    systemPrompt: 'Loaded from artifact via loadToolPrompt at runtime.'
  },
  
  confidence_builder: {
    toolName: 'confidence_builder',
    displayName: 'Confidence Builder',
    description: 'Build confidence during your job search',
    icon: 'Sparkles',
    category: 'strategy',
    triggers: {
      keywords: ['confidence', 'doubt', 'imposter', 'nervous'],
      phrases: ['feeling discouraged', 'build my confidence', 'imposter syndrome']
    },
    functionSchema: {
      name: 'confidence_builder',
      description: 'Help user overcome self-doubt and build job search confidence',
      parameters: z.object({
        challenge: z.string().optional()
      })
    },
    systemPrompt: 'Loaded from artifact via loadToolPrompt at runtime.'
  },
  
  interview_prep: {
    toolName: 'interview_prep',
    displayName: 'Interview Prep',
    description: 'Practice questions and feedback for your interview',
    icon: 'MessageSquare',
    category: 'interview',
    triggers: {
      keywords: ['interview', 'questions', 'prep'],
      phrases: ['help me prep for interview', 'practice interview questions', 'prepare for my interview']
    },
    functionSchema: {
      name: 'interview_prep',
      description: 'Generate role-specific interview questions and provide structured feedback',
      parameters: z.object({
        company: z.string().optional(),
        role: z.string().optional(),
        interview_stage: z.enum(['phone_screen', 'first_round', 'final', 'panel']).optional()
      })
    },
    systemPrompt: 'Loaded from artifact via loadToolPrompt at runtime.'
  },
  
  linkedin_presence: {
    toolName: 'linkedin_presence',
    displayName: 'LinkedIn Presence',
    description: 'Optimize your LinkedIn profile and presence',
    icon: 'Linkedin',
    category: 'linkedin',
    triggers: {
      keywords: ['linkedin', 'profile', 'headline', 'about'],
      phrases: ['optimize my linkedin', 'linkedin profile help', 'improve my linkedin']
    },
    functionSchema: {
      name: 'linkedin_presence',
      description: 'Guide user through LinkedIn profile optimization and content strategy',
      parameters: z.object({
        current_profile: z.string().optional(),
        goal: z.string().optional()
      })
    },
    systemPrompt: 'Loaded from artifact via loadToolPrompt at runtime.'
  },
  
  negotiations: {
    toolName: 'negotiations',
    displayName: 'Salary Negotiation',
    description: 'Negotiate your salary and benefits package',
    icon: 'DollarSign',
    category: 'negotiation',
    triggers: {
      keywords: ['salary', 'negotiate', 'offer', 'compensation'],
      phrases: ['negotiate my salary', 'counter offer', 'salary negotiation']
    },
    functionSchema: {
      name: 'negotiations',
      description: 'Guide user through salary and benefits negotiation',
      parameters: z.object({
        offer_details: z.string().optional(),
        target_salary: z.string().optional()
      })
    },
    systemPrompt: 'Loaded from artifact via loadToolPrompt at runtime.'
  },
  
  networking: {
    toolName: 'networking',
    displayName: 'Networking Strategy',
    description: 'Build and leverage your professional network',
    icon: 'Users',
    category: 'strategy',
    triggers: {
      keywords: ['network', 'connections', 'reach out', 'contact'],
      phrases: ['networking strategy', 'build my network', 'who should I contact']
    },
    functionSchema: {
      name: 'networking',
      description: 'Guide user through strategic networking and relationship building',
      parameters: z.object({
        target_industry: z.string().optional(),
        networking_goal: z.string().optional()
      })
    },
    systemPrompt: 'Loaded from artifact via loadToolPrompt at runtime.'
  },
  
  resumes: {
    toolName: 'resumes',
    displayName: 'Resume Makeover',
    description: 'Rewrite your resume with expert guidance',
    icon: 'FileText',
    category: 'resume',
    triggers: {
      keywords: ['resume', 'cv', 'bullets', 'experience', 'help with resume', 'resume help'],
      phrases: ['help me with my resume', 'help with my resume', 'i need help with my resume', 'rewrite my resume', 'optimize my cv', 'improve my bullets']
    },
    functionSchema: {
      name: 'resumes',
      description: 'Guide user through iterative resume rewrite with impact-focused bullets and ATS optimization',
      parameters: z.object({
        current_resume: z.string().optional(),
        target_role: z.string().optional()
      })
    },
    systemPrompt: 'Loaded from artifact via loadToolPrompt at runtime.'
  }
};

export function getAllTools(): ToolDefinition[] {
  return Object.values(TOOLS);
}

export function getTool(toolName: string): ToolDefinition | undefined {
  return TOOLS[toolName];
}

export function getToolsIndex(): string {
  return `SIGNATURE TOOLS AVAILABLE:

- Job Search Strategy: Plan and execute your job search effectively
- Confidence Builder: Build confidence during your job search
- Interview Prep: Practice questions and feedback for your interview
- LinkedIn Presence: Optimize your LinkedIn profile and presence
- Salary Negotiation: Negotiate your salary and benefits package
- Networking Strategy: Build and leverage your professional network
- Resume Makeover: Rewrite your resume with expert guidance

TOOL ROUTING RULES:
- Detect user intent from query
- If intent matches a tool, invoke it via function calling
- If uncertain, ask user to clarify
- Tools pull career file + memory context automatically
- Tools may propose memory writes - NEVER auto-save, always ask user first

When tool is invoked, you'll receive its full system prompt.
Until then, respond conversationally in the 1Yes voice.`;
}
