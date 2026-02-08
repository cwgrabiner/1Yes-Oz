'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import CareerFilePanel from '../chat/CareerFilePanel';
import MemoryPanel from '../chat/MemoryPanel';

type TabId = 'career' | 'memory';

function filledCountFromCareerFile(cf: { display_name?: string | null; user_current_role?: string | null; target_role?: string | null; goals?: string | null } | null): number {
  if (!cf) return 0;
  const fields = [cf.display_name, cf.user_current_role, cf.target_role, cf.goals];
  return fields.filter((v) => v != null && String(v).trim() !== '').length;
}

export default function BottomAnchor() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('career');
  const [displayName, setDisplayName] = useState<string>('Profile');
  const [filledCount, setFilledCount] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fetch Career File (same data source): display name + completion for 4 fields
  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      try {
        const res = await fetch('/api/career-file');
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data?.ok && data?.data?.careerFile) {
          const cf = data.data.careerFile;
          setFilledCount(filledCountFromCareerFile(cf));
          const name = cf.display_name?.trim();
          if (name) {
            setDisplayName(name);
            return;
          }
        }
      } catch {
        // ignore
      }
      if (cancelled) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user?.user_metadata?.full_name?.trim()) {
        setDisplayName(user.user_metadata.full_name.trim());
      } else if (user?.email) {
        setDisplayName(user.email.split('@')[0]);
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, []);

  // Open popup always to Career File tab
  const openPopup = useCallback(() => {
    setActiveTab('career');
    setIsOpen(true);
  }, []);

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTriggerClick = () => {
    if (isOpen) closePopup();
    else openPopup();
  };

  // ESC to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
    };
    if (isOpen) {
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }
  }, [isOpen, closePopup]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        popupRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) return;
      closePopup();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen, closePopup]);

  const triggerLabel = filledCount === 0 ? 'Complete your profile' : displayName;
  const triggerColorClass = filledCount === 4 ? 'text-white hover:text-green-400' : 'text-yellow-500 hover:text-yellow-400';
  const badgeColorClass = filledCount === 0 ? 'text-yellow-500 opacity-70' : 'text-zinc-400 opacity-70';

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleTriggerClick}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`${triggerLabel}, open Career File and Memory`}
        className={`w-full flex items-center justify-between text-left text-sm font-medium py-2 px-2 rounded-lg transition-colors border border-[#2a2a2a] bg-[#0a0a0a]/40 hover:bg-[#1a1a1a]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] min-h-[44px] ${triggerColorClass}`}
      >
        <span className="truncate">{triggerLabel}</span>
        <span className="flex items-center shrink-0 ml-1">
          {filledCount != null && filledCount < 4 && (
            <span className={`text-xs ml-2 ${badgeColorClass}`} aria-hidden>{filledCount}/4</span>
          )}
          <span className="text-current ml-1" aria-hidden>▾</span>
        </span>
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="
            fixed left-0 right-0 bottom-0 z-[60] max-h-[85vh] overflow-hidden
            flex flex-col rounded-t-xl border border-[#2a2a2a] border-b-0
            bg-[#111111] shadow-lg
            sm:absolute sm:bottom-full sm:left-0 sm:right-0 sm:mb-1
            sm:max-h-[70vh] sm:rounded-b-xl sm:rounded-t-xl sm:border-b
          "
          role="dialog"
          aria-label="Career File and Memory"
        >
          {/* Tab headers */}
          <div className="flex shrink-0 border-b border-[#2a2a2a] bg-[#0a0a0a]/50" role="tablist">
            <button
              type="button"
              onClick={() => setActiveTab('career')}
              role="tab"
              aria-selected={activeTab === 'career'}
              className={`
                flex-1 py-3 px-4 text-sm font-medium transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16a34a]/50
                ${activeTab === 'career'
                  ? 'text-zinc-200 border-b-2 border-[#16a34a] bg-[#111111]'
                  : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'}
              `}
            >
              Career File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('memory')}
              role="tab"
              aria-selected={activeTab === 'memory'}
              className={`
                flex-1 py-3 px-4 text-sm font-medium transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#16a34a]/50
                ${activeTab === 'memory'
                  ? 'text-zinc-200 border-b-2 border-[#16a34a] bg-[#111111]'
                  : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'}
              `}
            >
              Memory
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {activeTab === 'career' && <CareerFilePanel />}
            {activeTab === 'memory' && <MemoryPanel />}
          </div>
        </div>
      )}
    </div>
  );
}
