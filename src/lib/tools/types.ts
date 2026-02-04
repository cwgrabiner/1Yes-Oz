/** Guided entry for tools that support it (max 2 layers; Resume Makeover uses optional layer3). Disappears after selection or when user types. */
export type JobSearchEntryPrompts = {
  layer1: { intro: string; options: string[] };
  layer2: { intro: string; options: string[] };
  /** Optional third layer (Resume Makeover only). */
  layer3?: { intro: string; options: string[] };
};

export type ToolResult = {
  toolName: string;
  mode: 'coach' | 'wizard' | 'generator';
  message: string;
  ui?: {
    type: string;
    payload: any;
  };
  /** Entry prompts shown once on tool launch (e.g. Job Search Strategy, Interview Prep). */
  entryPrompts?: JobSearchEntryPrompts;
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
