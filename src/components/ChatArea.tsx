'use client';

import { useEffect, useRef } from 'react';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';
import ChatContainer from './chat/ChatContainer';

interface ChatAreaProps {
  slots: PromptContextSlots;
  onSlotsChange: (slots: PromptContextSlots) => void;
  onToolLaunchReady?: (handler: (toolName: string) => void) => void;
}

export default function ChatArea({ slots, onSlotsChange, onToolLaunchReady }: ChatAreaProps) {
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
      />
    </main>
  );
}
