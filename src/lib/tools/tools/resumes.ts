import { ToolExecutor, ToolResult } from '../types';

export const resumes: ToolExecutor = async (params, context) => {
  return {
    toolName: 'resumes',
    mode: 'wizard',
    message: "Let's rewrite your resume with expert guidance. I'll help you create impact-focused bullets and optimize for ATS.",
    next: {
      prompt: "Do you have your current resume ready? If so, share it and let me know what role you're targeting.",
      action: 'gather_resume'
    },
    entryPrompts: {
      layer1: {
        intro: "Let's work on your resume. What would you like to do?",
        options: [
          'Rewrite my entire resume',
          'Improve specific bullets or sections',
          'Tailor my resume for a specific role (ATS-friendly)',
        ],
      },
      layer2: {
        intro: 'Got it. What are we working with?',
        options: [
          'I already have a resume',
          "I'm starting from scratch",
          'I want to upload or paste my resume',
        ],
      },
      layer3: {
        intro: 'How would you like to tackle this?',
        options: [
          'One section or role at a time',
          'Focus on impact and metrics',
          'Make it tighter and more concise',
        ],
      },
    },
  };
};
