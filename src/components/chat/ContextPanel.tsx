'use client';

import { useState } from 'react';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';

interface ContextPanelProps {
  slots: PromptContextSlots;
  onSlotsChange: (slots: PromptContextSlots) => void;
}

export default function ContextPanel({ slots, onSlotsChange }: ContextPanelProps) {
  const [pasteDraft, setPasteDraft] = useState('');

  const handleAttachPastedText = () => {
    if (pasteDraft.trim()) {
      onSlotsChange({
        ...slots,
        pastedText: pasteDraft.trim(),
      });
      // Clear the draft after attaching
      setPasteDraft('');
    }
  };

  const handleClearContext = () => {
    onSlotsChange({});
    setPasteDraft('');
  };

  const hasContext = !!(slots.careerFileText || slots.pastedText);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Attach info</h3>
        {hasContext && (
          <button
            onClick={handleClearContext}
            className="text-xs text-zinc-400 transition-colors duration-200 hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Paste Text */}
      <div className="space-y-2">
        <label className="block text-xs text-zinc-400">Paste Text</label>
        <textarea
          value={pasteDraft}
          onChange={(e) => setPasteDraft(e.target.value)}
          placeholder="Paste text here..."
          className="w-full rounded border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:border-[#16a34a]/50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
          rows={4}
        />
        <button
          onClick={handleAttachPastedText}
          disabled={!pasteDraft.trim()}
          className="w-full rounded bg-[#1a1a1a] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors duration-200 hover:bg-[#16a34a]/10 hover:text-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Attach to chat
        </button>
        {slots.pastedText && (
          <p className="text-xs text-green-400">✓ Text attached</p>
        )}
      </div>
    </div>
  );
}
