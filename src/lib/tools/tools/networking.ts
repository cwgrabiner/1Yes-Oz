import { ToolExecutor, ToolResult } from '../types';

export const networking: ToolExecutor = async (params, context) => {
  return {
    toolName: 'networking',
    mode: 'wizard',
    message: "Let's build and leverage your professional network. I'll help you create a strategic networking plan.",
    next: {
      prompt: "What's your networking goal? Are you looking to break into a new industry, find referrals, or build relationships?",
      action: 'identify_networking_goal'
    },
    entryPrompts: {
      layer1: {
        intro: "Let's make networking feel more natural. What would you like help with?",
        options: [
          'Help me reach out to someone professionally',
          'Help me grow or activate my network',
          'Help me network without feeling awkward or salesy',
        ],
      },
      layer2: {
        intro: 'Got it. What should we start from?',
        options: [
          'A specific person or connection',
          "A role, company, or industry I'm targeting",
          'My existing network and background',
        ],
      },
    },
  };
};
