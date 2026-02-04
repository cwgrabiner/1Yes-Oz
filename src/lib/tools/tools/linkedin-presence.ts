import { ToolExecutor, ToolResult } from '../types';

export const linkedinPresence: ToolExecutor = async (params, context) => {
  return {
    toolName: 'linkedin_presence',
    mode: 'wizard',
    message: "Let's optimize your LinkedIn profile and presence. I'll help you stand out to recruiters and hiring managers.",
    next: {
      prompt: "What's your goal with LinkedIn? Are you looking to optimize your profile, build your network, or create content?",
      action: 'identify_goal'
    },
    entryPrompts: {
      layer1: {
        intro: "Let's work on your LinkedIn presence. What would you like help with?",
        options: [
          'Help me improve my LinkedIn profile',
          'Help me write or refine a LinkedIn post',
          'Help me show up more professionally on LinkedIn',
        ],
      },
      layer2: {
        intro: 'Got it. What should we start from?',
        options: [
          'My current LinkedIn profile',
          "A role or career direction I'm targeting",
          'A specific goal (visibility, recruiters, networking, etc.)',
        ],
      },
    },
  };
};
