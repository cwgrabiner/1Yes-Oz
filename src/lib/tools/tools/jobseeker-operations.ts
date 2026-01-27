import { ToolExecutor, ToolResult } from '../types';

export const jobseekerOperations: ToolExecutor = async (params, context) => {
  return {
    toolName: 'jobseeker_operations',
    mode: 'wizard',
    message: 'Let\'s build your job search strategy. I\'ll help you plan and execute your search effectively.',
    next: {
      prompt: 'What\'s your current situation? Are you actively searching, planning to start, or considering a career change?',
      action: 'gather_context'
    }
  };
};
