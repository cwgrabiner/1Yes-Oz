'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAllTools } from '@/lib/tools/definitions';
import * as Icons from 'lucide-react';
import ConversationHistory from './sidebar/ConversationHistory';
import BottomAnchor from './sidebar/BottomAnchor';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToolLaunch?: (toolName: string) => void;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onRefreshReady?: (refetch: () => void) => void;
  activeToolName?: string | null;
  activeConversationId?: string | null;
}

// Map tools to 3 polished categories
const CATEGORY_MAP: Record<string, 'Job Search' | 'Personal Brand' | 'Career Growth'> = {
  jobseeker_operations: 'Job Search',
  interview_prep: 'Job Search',
  linkedin_presence: 'Personal Brand',
  resumes: 'Personal Brand',
  confidence_builder: 'Career Growth',
  negotiations: 'Career Growth',
  networking: 'Career Growth',
};

const CATEGORY_ICONS: Record<string, keyof typeof Icons> = {
  'Job Search': 'Briefcase',
  'Personal Brand': 'UserCircle',
  'Career Growth': 'TrendingUp',
};

export default function Sidebar({
  isOpen,
  onClose,
  onToolLaunch,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRefreshReady,
  activeToolName,
  activeConversationId,
}: SidebarProps) {
  const router = useRouter();
  const [careerToolsExpanded, setCareerToolsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const tools = getAllTools();

  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = CATEGORY_MAP[tool.toolName] || 'Career Growth';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  const handleToolSelect = (toolName: string) => {
    onToolLaunch?.(toolName);
    if (window.innerWidth < 1024) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0a0a0a]/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-80 max-w-[320px] transform border-r border-[#2a2a2a] bg-[#111111] transition-transform duration-[250ms] ease-in-out lg:relative lg:top-0 lg:h-full overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col min-h-0 p-4 gap-4">
          {/* ZONE 1: New Chat */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => onNewChat?.()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-zinc-300 hover:border-[#16a34a]/40 hover:text-zinc-200 hover:bg-[#1a1a1a]/80 transition-colors"
              aria-label="New chat"
            >
              <Icons.SquarePen className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* ZONE 2: Career Tools (collapsed by default) */}
          <div className="shrink-0 border-t border-[#2a2a2a] pt-4">
            <button
              type="button"
              onClick={() => setCareerToolsExpanded((v) => !v)}
              className="w-full flex items-center justify-between text-left font-semibold text-sm text-zinc-300 hover:text-zinc-200 transition-colors"
            >
              <span>Career Tools</span>
              <span className={`transform transition-transform duration-200 ${careerToolsExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
            {careerToolsExpanded && (
              <div className="mt-3 space-y-1 pl-0">
                {(['Job Search', 'Personal Brand', 'Career Growth'] as const).map((category) => {
                  const categoryTools = toolsByCategory[category] || [];
                  const isExpanded = expandedCategories.has(category);
                  const IconName = CATEGORY_ICONS[category];
                  const CategoryIcon = IconName ? (Icons[IconName] as React.ComponentType<{ className?: string }>) : null;
                  return (
                    <div key={category} className="mb-2">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between text-left font-medium text-sm text-zinc-400 hover:text-zinc-300 mb-1"
                      >
                        <div className="flex items-center gap-2">
                          {CategoryIcon && <CategoryIcon className="w-3.5 h-3.5" />}
                          <span>{category}</span>
                        </div>
                        <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                          ▶
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="space-y-1 pl-6">
                          {categoryTools.map((tool) => {
                            const Icon = (Icons[tool.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>) || null;
                            const isActive = activeToolName === tool.toolName;
                            return (
                              <button
                                key={tool.toolName}
                                type="button"
                                onClick={() => handleToolSelect(tool.toolName)}
                                className={`
                                  w-full flex items-center gap-2 p-2.5 rounded transition-all duration-200 text-sm
                                  ${isActive
                                    ? 'border-l-4 border-green-500 bg-green-950/20 text-zinc-200'
                                    : 'text-zinc-300 hover:bg-[#1a1a1a] hover:text-zinc-200 hover:shadow-[0_0_8px_rgba(34,197,94,0.15)]'}
                                `}
                              >
                                {Icon && (
                                  <Icon className={`w-4 h-4 ${isActive ? 'text-green-400' : 'text-zinc-400'}`} />
                                )}
                                <div className="text-left flex-1">
                                  <div className="font-medium">{tool.displayName}</div>
                                  <div className={`text-xs ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {tool.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ZONE 3: Conversation History (own flex item, pushes Career File down) */}
          <div className="flex shrink flex-col min-h-[120px] flex-1 border-t border-[#2a2a2a] pt-4 overflow-hidden">
            <ConversationHistory
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onDeleteConversation={onDeleteConversation}
              onRefreshReady={onRefreshReady}
            />
          </div>

          {/* ZONE 4: Bottom anchor (tabbed popup) + Sign Out */}
          <div className="mt-auto border-t border-[#2a2a2a] pt-4 bg-[#0a0a0a]/50 -mx-4 px-4 pb-4">
            <div className="mt-4">
              <BottomAnchor />
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-[#2a2a2a] hover:text-zinc-300 mt-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
