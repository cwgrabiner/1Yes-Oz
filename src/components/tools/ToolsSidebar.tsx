'use client';

import { getAllTools } from '@/lib/tools/definitions';
import * as Icons from 'lucide-react';
import { useState } from 'react';

export function ToolsSidebar({ 
  onToolSelect 
}: { 
  onToolSelect: (toolName: string) => void;
}) {
  const tools = getAllTools();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);
  
  return (
    <div className="w-64 border-r border-[#2a2a2a] p-4">
      <h2 className="font-semibold mb-4 text-zinc-300">Signature Tools</h2>
      
      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
        <div key={category} className="mb-4">
          <button
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            className="w-full text-left font-medium text-sm text-zinc-300 mb-2 capitalize hover:text-zinc-200"
          >
            {category}
          </button>
          
          {expandedCategory === category && (
            <div className="space-y-1">
              {categoryTools.map(tool => {
                const Icon = Icons[tool.icon as keyof typeof Icons];
                
                return (
                  <button
                    key={tool.toolName}
                    onClick={() => onToolSelect(tool.toolName)}
                    className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#1a1a1a] text-sm text-zinc-300"
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <div className="text-left">
                      <div className="font-medium">{tool.displayName}</div>
                      <div className="text-xs text-zinc-500">
                        {tool.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
