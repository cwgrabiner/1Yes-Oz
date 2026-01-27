'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getAllTools } from '@/lib/tools/definitions';
import * as Icons from 'lucide-react';
import ContextPanel from './chat/ContextPanel';
import CareerFilePanel from './chat/CareerFilePanel';
import MemoryPanel from './chat/MemoryPanel';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  slots: PromptContextSlots;
  onSlotsChange: (slots: PromptContextSlots) => void;
  onToolLaunch?: (toolName: string) => void;
  activeToolName?: string | null;
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

export default function Sidebar({ isOpen, onClose, slots, onSlotsChange, onToolLaunch, activeToolName }: SidebarProps) {
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Job Search', 'Personal Brand', 'Career Growth']));
  const tools = getAllTools();
  
  // Group tools by new categories
  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = CATEGORY_MAP[tool.toolName] || 'Career Growth';
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (isOpen) {
      // Check if mobile (<1024px)
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);


  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  const handleToolSelect = (toolName: string) => {
    if (onToolLaunch) {
      onToolLaunch(toolName);
    }
    // Close sidebar on mobile after tool selection
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0a0a0a]/50 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-80 max-w-[320px] transform border-r border-[#2a2a2a] bg-[#111111] transition-transform duration-[250ms] ease-in-out lg:relative lg:top-0 lg:h-full overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-full flex-col p-4 space-y-6">
          {/* Section 1: Signature Tools */}
          <div>
            <h2 className="font-semibold mb-4 text-zinc-300">Signature Tools</h2>
            {(['Job Search', 'Personal Brand', 'Career Growth'] as const).map((category) => {
              const categoryTools = toolsByCategory[category] || [];
              const isExpanded = expandedCategories.has(category);
              const IconName = CATEGORY_ICONS[category];
              const CategoryIcon = IconName ? (Icons[IconName] as React.ComponentType<{ className?: string }>) : null;
              
              return (
                <div key={category} className="mb-3">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between text-left font-medium text-sm text-zinc-300 mb-2 hover:text-zinc-200 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      {CategoryIcon && <CategoryIcon className="w-4 h-4" />}
                      <span>{category}</span>
                    </div>
                    <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  </button>
                  
                  {isExpanded && (
                    <div className="space-y-1 pl-6">
                      {categoryTools.map(tool => {
                        const Icon = Icons[tool.icon as keyof typeof Icons];
                        const isActive = activeToolName === tool.toolName;
                        
                        return (
                          <button
                            key={tool.toolName}
                            onClick={() => handleToolSelect(tool.toolName)}
                            className={`
                              w-full flex items-center gap-2 p-2.5 rounded transition-all duration-200 text-sm
                              ${isActive 
                                ? 'border-l-4 border-green-500 bg-green-950/20 text-zinc-200' 
                                : 'text-zinc-300 hover:bg-[#1a1a1a] hover:text-zinc-200 hover:shadow-[0_0_8px_rgba(34,197,94,0.15)]'
                              }
                            `}
                          >
                            {Icon && (
                              <Icon 
                                className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-green-400' : 'text-zinc-400'}`} 
                              />
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

          {/* Section 2: Career File */}
          <div className="border-t border-[#2a2a2a] pt-4">
            <CareerFilePanel />
          </div>

          {/* Section 3: Uploads */}
          <div className="border-t border-[#2a2a2a] pt-4">
            <ContextPanel slots={slots} onSlotsChange={onSlotsChange} />
          </div>

          {/* Section 4: Memory */}
          <div className="border-t border-[#2a2a2a] pt-4">
            <MemoryPanel />
          </div>

          {/* Sign Out */}
          <div className="border-t border-[#2a2a2a] pt-4 mt-auto">
            <button
              onClick={handleSignOut}
              className="w-full rounded bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-[#2a2a2a] hover:text-zinc-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
