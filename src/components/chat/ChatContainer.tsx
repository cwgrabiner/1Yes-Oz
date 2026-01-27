'use client';

import { useState, useEffect } from 'react';
import type { Message } from '@/lib/chat/types';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';
import type { ToolResult } from '@/lib/tools/types';
import { appendMessage, normalizeMessages } from '@/lib/chat/history';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ErrorBanner from './ErrorBanner';
import ContextIndicator from './ContextIndicator';

interface ChatContainerProps {
  slots: PromptContextSlots;
  onSlotsChange: (slots: PromptContextSlots) => void;
  onToolLaunchRef?: (handler: (toolName: string) => void) => void;
}

export default function ChatContainer({ slots, onSlotsChange, onToolLaunchRef }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToolRunning, setIsToolRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRememberMemory = async (candidate: { key: string; value: string }) => {
    try {
      // Save memory item
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: candidate.key,
          value: candidate.value,
          source: 'explicit_confirmed',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error('Failed to save memory:', data.error);
        // Don't show error to user - memory save failure is non-blocking
        return;
      }

      // Add system message confirming save
      const systemMessage: Message = {
        role: 'system',
        content: `Saved: ${candidate.value}`,
      };
      setMessages((prev) => appendMessage(prev, systemMessage));
    } catch (err) {
      console.error('Error saving memory:', err);
      // Don't show error to user - memory save failure is non-blocking
    }
  };

  const handleClearContext = () => {
    onSlotsChange({});
  };

  const handleToolLaunch = async (toolName: string) => {
    setIsToolRunning(true);
    
    try {
      const response = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          toolName,
          params: {}
        })
      });
      
      if (!response.ok) {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Something went wrong launching that tool. Try again.'
        };
        setMessages((prev) => appendMessage(prev, errorMessage));
        return;
      }
      
      const result: ToolResult = await response.json();
      
      const toolMessage: Message = {
        role: 'assistant',
        content: result.message,
        toolResult: result
      };
      setMessages((prev) => appendMessage(prev, toolMessage));
      
      // Memory consent will be handled by MessageItem when rendering the toolResult
      
    } catch (error) {
      console.error('Tool launch failed:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Something went wrong launching that tool. Try again.'
      };
      setMessages((prev) => appendMessage(prev, errorMessage));
    } finally {
      setIsToolRunning(false);
    }
  };

  // Expose handleToolLaunch to parent via ref callback
  useEffect(() => {
    if (onToolLaunchRef) {
      onToolLaunchRef(handleToolLaunch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onToolLaunchRef]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isToolRunning) return;

    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage: Message = { role: 'user', content: content.trim() };
    const updatedMessages = appendMessage(messages, userMessage);
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/oz/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: normalizeMessages(updatedMessages),
          slots,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ text: 'Failed to get response' }));
        throw new Error(errorData.text || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.text || data.content || 'No response received';
      
      // Keep raw content with markers in state - MessageItem will strip for display
      // and detect candidates for consent UI
      const assistantMessage: Message = {
        role: 'assistant',
        content: rawContent,
      };

      setMessages(appendMessage(updatedMessages, assistantMessage));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = messages.length === 0 && !isLoading;

  // Empty state: Google/ChatGPT-style hero layout
  if (isEmpty) {
    return (
      <div className="relative flex h-full flex-col">
        <ErrorBanner error={error} onDismiss={() => setError(null)} />
        <div className="flex-1 flex flex-col">
          {/* Hero section: fixed positioning, centered in full viewport, top third */}
          <div className="flex-1 flex justify-center items-center px-4">
            <div className="flex w-full max-w-2xl flex-col items-center space-y-8">
              {/* Hero message */}
              <div className="text-center">
                <h2 className="mb-3 text-3xl font-semibold text-[#f5f5f5]">
                  How can I help with your career today?
                </h2>
                <p className="text-zinc-400">
                  Ask me anything about career planning, job search, or professional development.
                </p>
              </div>
              {/* Input centered below hero */}
              <div className="w-full max-w-3xl">
                <div className="mb-2">
                  <ContextIndicator slots={slots} onClear={handleClearContext} />
                </div>
                <ChatInput onSend={sendMessage} disabled={isLoading || isToolRunning} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal chat layout: messages + input pinned to bottom
  return (
    <div className="flex h-full flex-col">
      <ErrorBanner error={error} onDismiss={() => setError(null)} />
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          onRememberMemory={handleRememberMemory}
          onToolLaunch={handleToolLaunch}
        />
        <div className="border-t border-[#2a2a2a] p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2">
              <ContextIndicator slots={slots} onClear={handleClearContext} />
            </div>
            <ChatInput onSend={sendMessage} disabled={isLoading || isToolRunning} />
          </div>
        </div>
      </div>
    </div>
  );
}
