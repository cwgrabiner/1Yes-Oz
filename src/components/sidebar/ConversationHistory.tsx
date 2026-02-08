'use client';

import React, { useCallback, useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

type DateGroup = 'today' | 'yesterday' | 'older';

function getDateGroup(isoDate: string): DateGroup {
  const d = new Date(isoDate);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  if (d >= todayStart) return 'today';
  if (d >= yesterdayStart) return 'yesterday';
  return 'older';
}

function groupConversations(conversations: Conversation[]): Record<DateGroup, Conversation[]> {
  const groups: Record<DateGroup, Conversation[]> = {
    today: [],
    yesterday: [],
    older: [],
  };
  for (const c of conversations) {
    const group = getDateGroup(c.updated_at);
    groups[group].push(c);
  }
  return groups;
}

const GROUP_LABELS: Record<DateGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  older: 'Older',
};

const GROUP_ORDER: DateGroup[] = ['today', 'yesterday', 'older'];

interface ConversationHistoryProps {
  activeConversationId?: string | null;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRefreshReady?: (refetch: () => void) => void;
}

export default function ConversationHistory({
  activeConversationId = null,
  onSelectConversation,
  onDeleteConversation,
  onRefreshReady,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/conversations');
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error ?? 'Failed to load conversations');
        setConversations([]);
        return;
      }
      const list = json.data?.conversations ?? [];
      setConversations(list);
      console.log('[ConversationHistory] fetched conversations:', list);
    } catch {
      setError('Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    onRefreshReady?.(fetchConversations);
  }, [onRefreshReady, fetchConversations]);

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!onDeleteConversation || deletingId) return;
      if (!window.confirm('Delete this conversation?')) return;
      setDeletingId(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      onDeleteConversation(id);
      setTimeout(() => setDeletingId(null), 2000);
    },
    [onDeleteConversation, deletingId]
  );

  const groups = groupConversations(conversations);
  const displayTitle = (c: Conversation) => {
    const raw = c.title && c.title.trim() ? c.title.trim() : 'Untitled';
    return raw.length > 48 ? `${raw.slice(0, 48)}…` : raw;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-0">
        <h2 className="font-semibold text-sm text-zinc-300 mb-2 shrink-0">Conversations</h2>
        <div className="text-xs text-zinc-500 mb-2">Loading conversations...</div>
        <div className="flex-1 min-h-[120px] space-y-1 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 rounded-lg bg-[#1a1a1a]/60 animate-pulse"
              aria-hidden
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-0">
        <h2 className="font-semibold text-sm text-zinc-300 mb-2 shrink-0">Conversations</h2>
        <p className="text-xs text-zinc-500 mb-2">{error}</p>
        <button
          type="button"
          onClick={fetchConversations}
          className="self-start rounded-lg bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-[#2a2a2a] hover:text-zinc-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col min-h-0">
        <h2 className="font-semibold text-sm text-zinc-300 mb-2 shrink-0">Conversations</h2>
        <p className="text-xs text-zinc-500">No conversations yet.</p>
        <p className="text-xs text-zinc-600 mt-0.5">Start a chat to see it here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
      <h2 className="font-semibold text-sm text-zinc-300 mb-2 shrink-0">Conversations</h2>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4 pr-1 scroll-smooth">
        {GROUP_ORDER.map((groupKey) => {
          const items = groups[groupKey];
          if (items.length === 0) return null;
          return (
            <div key={groupKey}>
              <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">
                {GROUP_LABELS[groupKey]}
              </h3>
              <ul className="space-y-0.5">
                {items.map((c) => {
                  const isActive = activeConversationId === c.id;
                  const showTrash = hoveredId === c.id && onDeleteConversation;
                  return (
                    <li key={c.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelectConversation?.(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectConversation?.(c.id);
                          }
                        }}
                        onMouseEnter={() => setHoveredId(c.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`
                          group flex items-center gap-2 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]
                          ${isActive
                            ? 'bg-[#16a34a]/15 border border-[#16a34a]/40 text-zinc-200'
                            : 'text-zinc-300 hover:bg-[#1a1a1a] hover:text-zinc-200 border border-transparent'}
                        `}
                      >
                        <span className="flex-1 truncate min-w-0">{displayTitle(c)}</span>
                        {showTrash && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(e, c.id)}
                            disabled={deletingId === c.id}
                            aria-label={`Delete "${displayTitle(c)}"`}
                            className="shrink-0 p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a]/50 disabled:opacity-50 disabled:pointer-events-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                          >
                            <Icons.Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
