export type ToolResult = {
  toolName: string;
  mode: 'coach' | 'wizard' | 'generator';
  message: string;
  ui?: {
    type: string;
    payload: any;
  };
  proposedMemoryWrites?: Array<{
    key: string;
    value: string;
    reason: string;
  }>;
  next?: {
    prompt: string;
    action?: string;
  };
};

export type ToolExecutor = (
  params: any,
  context: {
    userId: string;
    careerFile?: string;
    memories?: any[];
  }
) => Promise<ToolResult>;
