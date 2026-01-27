'use client';

import { useEffect, useRef, useMemo } from 'react';
import type { Message } from '@/lib/chat/types';
import { getTool } from '@/lib/tools/definitions';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onRememberMemory?: (candidate: { key: string; value: string }) => Promise<void>;
  onToolLaunch?: (toolName: string) => void;
}

export default function MessageList({ messages, isLoading, onRememberMemory, onToolLaunch }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive active tool from most recent message with toolResult
  const activeToolName = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].toolResult?.toolName) {
        return messages[i].toolResult.toolName;
      }
    }
    return null;
  }, [messages]);

  const activeTool = activeToolName ? getTool(activeToolName) : null;

  useEffect(() => {
    // Auto-scroll to bottom when messages change or loading state changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h2 className="mb-3 text-2xl font-semibold text-[#f5f5f5]">
            How can I help with your career today?
          </h2>
          <p className="text-zinc-400">
            Ask me anything about career planning, job search, or professional development.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Tool active pill indicator */}
      {activeTool && (
        <div className="sticky top-0 z-10 flex justify-center pt-4 pb-2">
          <div className="rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
            🔧 {activeTool.displayName} active
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
        {messages.map((message, index) => (
          <MessageItem 
            key={index} 
            message={message}
            messageIndex={index}
            messageCount={messages.length}
            onRememberMemory={onRememberMemory}
            onToolLaunch={onToolLaunch}
          />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-[#1a1a1a]/80 px-4 py-3">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400"></span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 delay-75"></span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400 delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
