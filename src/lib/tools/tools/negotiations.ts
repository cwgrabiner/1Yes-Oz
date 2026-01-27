import { ToolExecutor, ToolResult } from '../types';

export const negotiations: ToolExecutor = async (params, context) => {
  return {
    toolName: 'negotiations',
    mode: 'wizard',
    message: 'Let\'s negotiate your salary and benefits package. I\'ll guide you through the process step by step.',
    next: {
      prompt: 'Do you have an offer in hand, or are you preparing for a negotiation? Share the details if you have them.',
      action: 'gather_offer_details'
    }
  };
};
