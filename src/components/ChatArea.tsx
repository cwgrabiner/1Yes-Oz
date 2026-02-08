'use client';

import { useEffect, useRef } from 'react';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';
import ChatContainer from './chat/ChatContainer';

interface ChatAreaProps {
  slots: PromptContextSlots;
  onSlotsChange: (slots: PromptContextSlots) => void;
  onToolLaunchReady?: (handler: (toolName: string) => void) => void;
  onResetReady?: (reset: () => void) => void;
  onLoadConversationReady?: (load: (conversationId: string) => Promise<void>) => void;
  onConversationIdChange?: (conversationId: string | null) => void;
  onConversationCreated?: () => void;
  onErrorReady?: (setError: (msg: string | null) => void) => void;
}

export default function ChatArea({ slots, onSlotsChange, onToolLaunchReady, onResetReady, onLoadConversationReady, onConversationIdChange, onConversationCreated, onErrorReady }: ChatAreaProps) {
  const toolLaunchRef = useRef<((toolName: string) => void) | null>(null);

  useEffect(() => {
    if (toolLaunchRef.current && onToolLaunchReady) {
      onToolLaunchReady(toolLaunchRef.current);
    }
  }, [onToolLaunchReady]);

  return (
    <main className="flex flex-1 flex-col">
      <ChatContainer 
        slots={slots} 
        onSlotsChange={onSlotsChange} 
        onToolLaunchRef={(handler) => {
          toolLaunchRef.current = handler;
          if (onToolLaunchReady) {
            onToolLaunchReady(handler);
          }
        }}
        onResetReady={onResetReady}
        onLoadConversationReady={onLoadConversationReady}
        onConversationIdChange={onConversationIdChange}
        onConversationCreated={onConversationCreated}
        onErrorReady={onErrorReady}
      />
    </main>
  );
}
