import { ToolExecutor, ToolResult } from '../types';

export const interviewPrep: ToolExecutor = async (params, context) => {
  return {
    toolName: 'interview_prep',
    mode: 'wizard',
    message: 'Let\'s get you ready for your interview. I\'ll help you practice questions and get structured feedback.',
    next: {
      prompt: 'Tell me about the role and company you\'re interviewing for, and what stage you\'re at.',
      action: 'gather_interview_details'
    }
  };
};
