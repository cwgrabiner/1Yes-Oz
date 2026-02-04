'use client';

import { useState, useEffect } from 'react';
import { getRandomChipSet } from '@/lib/guidance/homeChips';
import type { HomeChip } from '@/lib/guidance/homeChips';

interface HomeStarterChipsProps {
  onChipClick: (text: string, toolName?: string) => void;
  isVisible: boolean;
}

export default function HomeStarterChips({ onChipClick, isVisible }: HomeStarterChipsProps) {
  const [chips] = useState<[HomeChip, HomeChip, HomeChip]>(() => getRandomChipSet());
  const [mounted, setMounted] = useState(false);

  // Only render after client hydration completes
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (chip: HomeChip) => {
    onChipClick(chip.text, chip.toolName);
  };

  // Don't render anything until mounted on client
  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl mt-3">
      <div
        className="flex flex-col gap-3 items-center"
        role="group"
        aria-label="Suggested prompts"
      >
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleClick(chip)}
            className="px-5 py-3 rounded-xl text-sm bg-[#0a0a0a] border border-[#16a34a]/30 text-zinc-300 hover:border-[#16a34a]/80 hover:bg-[#0a0a0a] hover:text-white hover:shadow-[0_0_15px_rgba(22,163,74,0.3)] focus:outline-none focus:border-[#16a34a] focus:shadow-[0_0_20px_rgba(22,163,74,0.4)] active:scale-[0.98] transition-all duration-200 min-h-[40px] w-full max-w-md"
          >
            {chip.text}
          </button>
        ))}
      </div>
    </div>
  );
}
