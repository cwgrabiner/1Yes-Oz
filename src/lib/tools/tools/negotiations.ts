import { ToolExecutor, ToolResult } from '../types';

export const negotiations: ToolExecutor = async (params, context) => {
  return {
    toolName: 'negotiations',
    mode: 'wizard',
    message: "Let's negotiate your salary and benefits package. I'll guide you through the process step by step.",
    next: {
      prompt: 'Do you have an offer in hand, or are you preparing for a negotiation? Share the details if you have them.',
      action: 'gather_offer_details'
    },
    entryPrompts: {
      layer1: {
        intro: "Let's talk compensation. What's your situation right now?",
        options: [
          'I have an offer and want to negotiate',
          "I'm preparing for a compensation conversation",
          'I want to understand my market value',
        ],
      },
      layer2: {
        intro: 'Got it. What would you like help with?',
        options: [
          'What to say (language and framing)',
          "What's reasonable to ask for",
          'How to negotiate confidently without burning bridges',
        ],
      },
    },
  };
};
