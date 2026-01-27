'use client';

import Image from 'next/image';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="flex h-14 items-center border-b border-[#2a2a2a] bg-[#111111] px-4">
      <button
        onClick={onToggleSidebar}
        className="mr-4 rounded p-2 text-zinc-400 transition-colors duration-200 hover:bg-[#1a1a1a] hover:text-[#f5f5f5]"
        aria-label="Toggle sidebar"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <Image
        src="/logo/1y-logo.png"
        alt="1Yes"
        width={96}
        height={32}
      />
    </header>
  );
}
