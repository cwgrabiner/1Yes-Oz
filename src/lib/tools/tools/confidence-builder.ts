import { ToolExecutor, ToolResult } from '../types';

export const confidenceBuilder: ToolExecutor = async (params, context) => {
  return {
    toolName: 'confidence_builder',
    mode: 'coach',
    message: "I'm here to help you build confidence during your job search. Let's work through what's holding you back.",
    next: {
      prompt: 'What specific challenge or doubt are you facing right now?',
      action: 'identify_challenge'
    },
    entryPrompts: {
      layer1: {
        intro: "Let's reset a bit. What's going on right now?",
        options: [
          "I'm feeling discouraged or burnt out",
          "I'm doubting myself or my experience",
          "I need a confidence boost before something important",
        ],
      },
      layer2: {
        intro: 'What would help most right now?',
        options: [
          'Perspective and reassurance',
          'A quick reset or mindset shift',
          'Practical reminders of my strengths',
        ],
      },
    },
  };
};
