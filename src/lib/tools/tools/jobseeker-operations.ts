import { ToolExecutor, ToolResult } from '../types';

export const jobseekerOperations: ToolExecutor = async (params, context) => {
  return {
    toolName: 'jobseeker_operations',
    mode: 'wizard',
    message: "Let's build your job search strategy. I'll help you plan and execute your search effectively.",
    next: {
      prompt: "What's your current situation? Are you actively searching, planning to start, or considering a career change?",
      action: 'gather_context'
    },
    entryPrompts: {
      layer1: {
        intro: "Let's get focused. What would you like help with?",
        options: [
          'Build me a simple job search plan',
          'Help me target roles and companies',
          'Help me build a weekly job search routine',
        ],
      },
      layer2: {
        intro: 'Great. What should we base this on?',
        options: [
          'My current role and experience',
          'A target role I want',
          'A specific job posting',
        ],
      },
    },
  };
};
