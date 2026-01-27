'use client';

import { useState } from 'react';
import type { Message } from '@/lib/chat/types';
import { parseMemoryCandidates, stripMemoryMarkers } from '@/lib/memory/parse';
import MemoryConsentChip from './MemoryConsentChip';

interface MessageItemProps {
  message: Message;
  messageIndex: number;
  messageCount: number;
  onRememberMemory?: (candidate: { key: string; value: string }) => Promise<void>;
  onToolLaunch?: (toolName: string) => void;
}

export default function MessageItem({ message, messageIndex, messageCount, onRememberMemory, onToolLaunch }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const [dismissedCandidates, setDismissedCandidates] = useState<Set<string>>(new Set());

  // Render system messages (e.g., "Saved: {value}") but with muted styling
  if (message.role === 'system') {
    return (
      <div className="flex justify-center">
        <div className="rounded-lg bg-[#1a1a1a]/40 px-4 py-2 text-xs text-zinc-400">
          {message.content}
        </div>
      </div>
    );
  }

  // Parse memory candidates from assistant messages
  const memoryCandidates = isAssistant ? parseMemoryCandidates(message.content) : [];
  const displayText = stripMemoryMarkers(message.content);

  // Get proposed memory writes from toolResult if present
  const toolMemoryWrites = message.toolResult?.proposedMemoryWrites || [];

  // Filter out dismissed candidates
  const activeCandidates = memoryCandidates.filter(
    (candidate) => !dismissedCandidates.has(`${candidate.key}:${candidate.value}`)
  );

  // Filter out dismissed tool memory writes
  const activeToolMemoryWrites = toolMemoryWrites.filter(
    (write) => !dismissedCandidates.has(`${write.key}:${write.value}`)
  );

  const handleDismiss = (candidate: { key: string; value: string }) => {
    setDismissedCandidates((prev) => new Set(prev).add(`${candidate.key}:${candidate.value}`));
  };

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      style={{
        animation: 'fadeIn 0.3s ease-in',
      }}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'ml-auto border-l-4 border-green-500 bg-green-950/20 text-[#f5f5f5]'
            : 'mr-auto bg-zinc-900/50 text-[#f5f5f5]'
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {displayText}
        </div>
        {/* Show consent chip for first active candidate only */}
        {isAssistant && activeCandidates.length > 0 && onRememberMemory && (
          <MemoryConsentChip
            candidate={activeCandidates[0]}
            onRemember={onRememberMemory}
            onDismiss={() => handleDismiss(activeCandidates[0])}
          />
        )}
        {/* Show consent chips for tool-proposed memory writes */}
        {isAssistant && activeToolMemoryWrites.length > 0 && onRememberMemory && (
          <div className="mt-2 space-y-2">
            {activeToolMemoryWrites.map((write, idx) => (
              <MemoryConsentChip
                key={`${write.key}:${write.value}:${idx}`}
                candidate={{ key: write.key, value: write.value }}
                onRemember={onRememberMemory}
                onDismiss={() => handleDismiss({ key: write.key, value: write.value })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
