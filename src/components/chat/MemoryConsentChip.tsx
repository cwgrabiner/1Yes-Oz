'use client';

import { useState } from 'react';

interface MemoryConsentChipProps {
  candidate: { key: string; value: string };
  messageId?: string;
  onRemember: (candidate: { key: string; value: string }) => Promise<void>;
  onDismiss: () => void;
}

export default function MemoryConsentChip({
  candidate,
  onRemember,
  onDismiss,
}: MemoryConsentChipProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleRemember = async () => {
    setIsSaving(true);
    try {
      await onRemember(candidate);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-2 rounded border border-[#2a2a2a] bg-[#1a1a1a]/60 px-3 py-2 text-xs">
      <div className="mb-2 text-zinc-400">
        Want me to remember that?
      </div>
      <div className="mb-2 rounded bg-[#1a1a1a] px-2 py-1 text-zinc-300">
        <span className="font-medium">{candidate.key}:</span> {candidate.value}
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleRemember}
          disabled={isSaving}
          className="rounded bg-[#16a34a]/20 px-3 py-1 text-xs font-medium text-[#16a34a] transition-colors duration-200 hover:bg-[#16a34a]/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Remember'}
        </button>
        <button
          onClick={onDismiss}
          disabled={isSaving}
          className="rounded px-3 py-1 text-xs font-medium text-zinc-400 transition-colors duration-200 hover:bg-[#1a1a1a] hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          No
        </button>
      </div>
    </div>
  );
}
