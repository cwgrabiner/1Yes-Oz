'use client';

import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';

interface ContextIndicatorProps {
  slots: PromptContextSlots;
  onClear: () => void;
}

export default function ContextIndicator({ slots, onClear }: ContextIndicatorProps) {
  const hasContext = !!(slots.careerFileText || slots.pastedText);

  if (!hasContext) return null;

  return (
    <button
      onClick={onClear}
      className="group flex items-center gap-1.5 rounded-full border border-zinc-700/50 bg-[#1a1a1a]/60 px-3 py-1.5 text-xs text-zinc-400 transition-colors duration-200 hover:border-zinc-600 hover:bg-[#1a1a1a] hover:text-zinc-300"
      title="Click to remove context"
    >
      <span>Context: attached</span>
      <svg
        className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
