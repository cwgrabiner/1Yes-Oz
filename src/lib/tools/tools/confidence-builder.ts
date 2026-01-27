import { ToolExecutor, ToolResult } from '../types';

export const confidenceBuilder: ToolExecutor = async (params, context) => {
  return {
    toolName: 'confidence_builder',
    mode: 'coach',
    message: 'I\'m here to help you build confidence during your job search. Let\'s work through what\'s holding you back.',
    next: {
      prompt: 'What specific challenge or doubt are you facing right now?',
      action: 'identify_challenge'
    }
  };
};
