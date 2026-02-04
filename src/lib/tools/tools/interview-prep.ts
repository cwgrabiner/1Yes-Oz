import { ToolExecutor, ToolResult } from '../types';

export const interviewPrep: ToolExecutor = async (params, context) => {
  return {
    toolName: 'interview_prep',
    mode: 'wizard',
    message: "Let's get you ready for your interview. I'll help you practice questions and get structured feedback.",
    next: {
      prompt: "Tell me about the role and company you're interviewing for, and what stage you're at.",
      action: 'gather_interview_details'
    },
    entryPrompts: {
      layer1: {
        intro: "Let's get you ready. What would you like help with?",
        options: [
          'Help me research for an upcoming interview',
          'Give me sample interview questions for my target role',
          'Help me improve my interview answers (STAR stories)',
        ],
      },
      layer2: {
        intro: 'Great. What should we start from?',
        options: [
          "A specific job I'm interviewing for",
          'A target role or type of role',
          'My background and experience',
        ],
      },
    },
  };
};
