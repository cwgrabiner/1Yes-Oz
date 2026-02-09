'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Message } from '@/lib/chat/types';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';
import type { ToolResult } from '@/lib/tools/types';
import { FileText, X } from 'lucide-react';
import { appendMessage, normalizeMessages } from '@/lib/chat/history';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import HomeStarterChips from './HomeStarterChips';
import ErrorBanner from './ErrorBanner';
import ContextIndicator from './ContextIndicator';

interface ChatContainerProps {
  slots: PromptContextSlots;
  onSlotsChange: (slots: PromptContextSlots) => void;
  onToolLaunchRef?: (handler: (toolName: string) => void) => void;
  onResetReady?: (reset: () => void) => void;
  onLoadConversationReady?: (load: (conversationId: string) => Promise<void>) => void;
  onConversationIdChange?: (conversationId: string | null) => void;
  onConversationCreated?: () => void;
  onErrorReady?: (setError: (msg: string | null) => void) => void;
}

/** One attached file (uploaded via input bar); text is from ingest API. */
interface AttachedFile {
  id: string;
  name: string;
  text: string;
}

// Map chip toolName (homeChips) to actual tool name (definitions/registry)
const CHIP_TOOL_NAME_MAP: Record<string, string> = {
  resume: 'resumes',
  interview: 'interview_prep',
  linkedin: 'linkedin_presence',
  salary: 'negotiations',
  confidence: 'confidence_builder',
  'job-search': 'jobseeker_operations',
  networking: 'networking',
};

export default function ChatContainer({ slots, onSlotsChange, onToolLaunchRef, onResetReady, onLoadConversationReady, onConversationIdChange, onConversationCreated, onErrorReady }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isToolRunning, setIsToolRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeToolName, setActiveToolName] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [loadErrorConversationId, setLoadErrorConversationId] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const attachedFilesRef = useRef<AttachedFile[]>([]);
  attachedFilesRef.current = attachedFiles;

  const resetChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setActiveToolName(null);
    setError(null);
    setAttachedFiles([]);
    onConversationIdChange?.(null);
  }, [onConversationIdChange]);

  const loadConversation = useCallback(
    async (id: string) => {
      setError(null);
      setLoadErrorConversationId(null);
      try {
        const res = await fetch(`/api/conversations/${id}/messages`);
        const json = await res.json();
        if (!res.ok || !json.ok) {
          setError(json.error ?? 'Failed to load conversation');
          setLoadErrorConversationId(id);
          return;
        }
        const raw = json.data?.messages ?? [];
        const loaded: Message[] = raw.map((m: { role: string; content: string; tool_result?: unknown }) => ({
          role: m.role as Message['role'],
          content: m.content ?? '',
          ...(m.tool_result != null && { toolResult: m.tool_result as ToolResult }),
        }));
        setMessages(loaded);
        setConversationId(id);
        setActiveToolName(null);
        setAttachedFiles([]);
        onConversationIdChange?.(id);
      } catch {
        setError('Failed to load conversation');
        setLoadErrorConversationId(id);
      }
    },
    [onConversationIdChange]
  );

  // Derive "tool active" from messages (last message with toolResult) so chips/placeholder hide when in a tool
  const hasActiveToolFromMessages = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].toolResult?.toolName) return true;
    }
    return false;
  }, [messages]);

  const isStreaming = isLoading;
  const shouldShowHomeChips =
    !activeToolName &&
    !hasActiveToolFromMessages &&
    messages.length === 0 &&
    !isStreaming &&
    draftMessage.length === 0;

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
    setAttachedFiles([]);
    onSlotsChange({});
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/oz/ingest', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        throw new Error(data.error);
      }
      if (!data.text) return;
      const newFile: AttachedFile = { id: crypto.randomUUID(), name: file.name, text: data.text };
      const newList = [...attachedFiles, newFile];
      setAttachedFiles(newList);
      onSlotsChange({ ...slots, careerFileText: newList.map((f) => f.text).join('\n\n') });
    },
    [attachedFiles, slots, onSlotsChange]
  );

  const handleRemoveAttachedFile = useCallback(
    (id: string) => {
      const newList = attachedFiles.filter((f) => f.id !== id);
      setAttachedFiles(newList);
      onSlotsChange({
        ...slots,
        careerFileText: newList.length > 0 ? newList.map((f) => f.text).join('\n\n') : undefined,
      });
    },
    [attachedFiles, slots, onSlotsChange]
  );

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

  const handleChipClick = async (text: string, toolName?: string) => {
    if (toolName) {
      // Tool launch: same as sidebar — map chip name to app tool name and call handleToolLaunch (fire-and-forget)
      const appToolName = CHIP_TOOL_NAME_MAP[toolName] ?? toolName;
      handleToolLaunch(appToolName);
    } else {
      // Regular message: send as chat
      await sendMessage(text);
    }
  };

  // Expose handleToolLaunch to parent via ref callback
  useEffect(() => {
    if (onToolLaunchRef) {
      onToolLaunchRef(handleToolLaunch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onToolLaunchRef]);

  // Expose reset (New Chat) to parent
  useEffect(() => {
    onResetReady?.(resetChat);
  }, [onResetReady, resetChat]);

  // Expose loadConversation to parent (sidebar click)
  useEffect(() => {
    onLoadConversationReady?.(loadConversation);
  }, [onLoadConversationReady, loadConversation]);

  // Expose setError so parent can show errors (e.g. delete conversation failure)
  useEffect(() => {
    onErrorReady?.(setError);
  }, [onErrorReady]);

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
      const currentAttached = attachedFilesRef.current;

      // Build request with slots inline to prevent any mutation
      const messagesPayload = normalizeMessages(updatedMessages);
      const slotsPayload = currentAttached.length > 0
        ? { ...slots, careerFileText: currentAttached.map((f) => f.text).join('\n\n') }
        : { ...slots };

      const requestBody = {
        messages: messagesPayload,
        slots: { ...slotsPayload },  // Spread to create new object
        conversationId: conversationId ?? undefined,
      };

      // Verify slots made it into requestBody
      if (currentAttached.length > 0 && (!requestBody.slots?.careerFileText)) {
        console.error('CRITICAL BUG: File attached but slots.careerFileText missing');
        console.error('Attached files:', currentAttached.map(f => f.name));
        console.error('Request body:', requestBody);
        setError('File upload failed - please try again');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/oz/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ text: 'Failed to get response' }));
        throw new Error(errorData.text || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.text || data.content || 'No response received';
      if (data.conversationId) {
        setConversationId(data.conversationId);
        onConversationIdChange?.(data.conversationId);
        onConversationCreated?.();
      }

      // Keep raw content with markers in state - MessageItem will strip for display
      // and detect candidates for consent UI
      const assistantMessage: Message = {
        role: 'assistant',
        content: rawContent,
      };

      setMessages(appendMessage(updatedMessages, assistantMessage));
      setAttachedFiles([]);
      onSlotsChange({ ...slots, careerFileText: undefined });
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
        <ErrorBanner
          error={error}
          onDismiss={() => {
            setError(null);
            setLoadErrorConversationId(null);
          }}
          onRetry={loadErrorConversationId ? () => loadConversation(loadErrorConversationId) : undefined}
        />
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
              <div className="w-full max-w-3xl space-y-3">
                <div className="input-wrapper">
                  <div className="mb-2">
                    <ContextIndicator slots={slots} onClear={handleClearContext} />
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachedFiles.map((f) => (
                        <div
                          key={f.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] pl-2 pr-1 py-1.5 text-xs text-zinc-300"
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                          <span className="max-w-[140px] truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachedFile(f.id)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2a2a] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -m-1"
                            aria-label={`Remove ${f.name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <ChatInput
                    onSend={sendMessage}
                    disabled={isLoading || isToolRunning}
                    showHomeChips={shouldShowHomeChips}
                    onUpload={handleFileUpload}
                  />
                </div>
                <HomeStarterChips
                  isVisible={shouldShowHomeChips}
                  onChipClick={handleChipClick}
                />
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
      <ErrorBanner
        error={error}
        onDismiss={() => {
          setError(null);
          setLoadErrorConversationId(null);
        }}
        onRetry={loadErrorConversationId ? () => loadConversation(loadErrorConversationId) : undefined}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
          onRememberMemory={handleRememberMemory}
          onToolLaunch={handleToolLaunch}
          onEntryPromptSelect={sendMessage}
        />
        <div className="border-t border-[#2a2a2a] p-4">
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="input-wrapper">
              <div className="mb-2">
                <ContextIndicator slots={slots} onClear={handleClearContext} />
              </div>
              {attachedFiles.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachedFiles.map((f) => (
                    <div
                      key={f.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] pl-2 pr-1 py-1.5 text-xs text-zinc-300"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                      <span className="max-w-[140px] truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedFile(f.id)}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2a2a] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center -m-1"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ChatInput
                onSend={sendMessage}
                disabled={isLoading || isToolRunning}
                showHomeChips={shouldShowHomeChips}
                onUpload={handleFileUpload}
              />
            </div>
            <HomeStarterChips
              isVisible={shouldShowHomeChips}
              onChipClick={handleChipClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
