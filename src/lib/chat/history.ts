import type { Message } from './types';

/**
 * Normalizes messages by removing duplicates and enforcing role alternation.
 * Ensures messages follow a valid conversation pattern.
 */
export function normalizeMessages(messages: Message[]): Message[] {
  if (messages.length === 0) return [];

  const normalized: Message[] = [];
  let lastRole: Message['role'] | null = null;

  for (const msg of messages) {
    // Skip duplicates (same role and content as previous)
    if (
      normalized.length > 0 &&
      normalized[normalized.length - 1].role === msg.role &&
      normalized[normalized.length - 1].content === msg.content
    ) {
      continue;
    }

    // Enforce role alternation (skip if same role as previous, except for system messages)
    if (lastRole !== null && msg.role !== 'system' && msg.role === lastRole) {
      continue;
    }

    normalized.push(msg);
    if (msg.role !== 'system') {
      lastRole = msg.role;
    }
  }

  return normalized;
}

/**
 * Immutably appends a new message to the messages array.
 */
export function appendMessage(
  messages: Message[],
  newMessage: Message
): Message[] {
  return [...messages, newMessage];
}

/**
 * Trims messages to fit within a token budget.
 * TODO Phase 2: Implement actual token counting and trimming logic.
 * For now, returns messages as-is.
 */
export function trimMessagesForTokenBudget(
  messages: Message[],
  maxTokens: number
): Message[] {
  // TODO: Implement token counting (e.g., using tiktoken or similar)
  // TODO: Trim oldest messages (except system messages) to fit within budget
  // TODO: Ensure at least the most recent user-assistant exchange is preserved
  return messages;
}
