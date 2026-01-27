'use client';

import { useState, useEffect, useRef } from 'react';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatArea from './ChatArea';

const SIDEBAR_STORAGE_KEY = '1yes-sidebar-open';

export default function Shell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slots, setSlots] = useState<PromptContextSlots>({});
  const toolLaunchHandlerRef = useRef<((toolName: string) => void) | null>(null);

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
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          slots={slots}
          onSlotsChange={setSlots}
          onToolLaunch={handleToolLaunch}
        />
        <ChatArea 
          slots={slots} 
          onSlotsChange={setSlots} 
          onToolLaunchReady={(handler) => {
            toolLaunchHandlerRef.current = handler;
          }}
        />
      </div>
    </div>
  );
}
