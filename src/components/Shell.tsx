'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatArea from './ChatArea';

const SIDEBAR_STORAGE_KEY = '1yes-sidebar-open';

export default function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slots, setSlots] = useState<PromptContextSlots>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const toolLaunchHandlerRef = useRef<((toolName: string) => void) | null>(null);
  const resetChatRef = useRef<(() => void) | null>(null);
  const loadConversationRef = useRef<((conversationId: string) => Promise<void>) | null>(null);
  const refreshConversationsRef = useRef<(() => void) | null>(null);
  const setErrorRef = useRef<((msg: string | null) => void) | null>(null);

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (data.success !== true && data.ok !== true)) {
        throw new Error(data.error ?? 'Delete failed');
      }
      if (id === activeConversationId) {
        resetChatRef.current?.();
      }
    } catch {
      setErrorRef.current?.('Failed to delete conversation. Try again.');
      refreshConversationsRef.current?.();
    }
  }, [activeConversationId]);

  // Restore sidebar state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    } else {
      // Default to closed on first visit
      setSidebarOpen(false);
    }
  }, []);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const handleToolLaunch = (toolName: string) => {
    // Forward to ChatContainer's handler
    if (toolLaunchHandlerRef.current) {
      toolLaunchHandlerRef.current(toolName);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#111111] text-[#f5f5f5]">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={() => resetChatRef.current?.()}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToolLaunch={handleToolLaunch}
          onNewChat={() => resetChatRef.current?.()}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => loadConversationRef.current?.(id)}
          onDeleteConversation={handleDeleteConversation}
          onRefreshReady={(refetch) => {
            refreshConversationsRef.current = refetch;
          }}
        />
        <ChatArea 
          slots={slots} 
          onSlotsChange={setSlots} 
          onToolLaunchReady={(handler) => {
            toolLaunchHandlerRef.current = handler;
          }}
          onResetReady={(reset) => {
            resetChatRef.current = reset;
          }}
          onLoadConversationReady={(load) => {
            loadConversationRef.current = load;
          }}
          onConversationIdChange={setActiveConversationId}
          onConversationCreated={() => refreshConversationsRef.current?.()}
          onErrorReady={(setError) => {
            setErrorRef.current = setError;
          }}
        />
      </div>
    </div>
  );
}
