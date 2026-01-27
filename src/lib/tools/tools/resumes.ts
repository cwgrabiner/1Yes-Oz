import { ToolExecutor, ToolResult } from '../types';

export const resumes: ToolExecutor = async (params, context) => {
  return {
    toolName: 'resumes',
    mode: 'wizard',
    message: 'Let\'s rewrite your resume with expert guidance. I\'ll help you create impact-focused bullets and optimize for ATS.',
    next: {
      prompt: 'Do you have your current resume ready? If so, share it and let me know what role you\'re targeting.',
      action: 'gather_resume'
    }
  };
};
