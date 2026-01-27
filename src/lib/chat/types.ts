import type { ToolResult } from '@/lib/tools/types';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  toolResult?: ToolResult;
}
