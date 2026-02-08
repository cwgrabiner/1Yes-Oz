'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SquarePen, MoreVertical, Settings, HelpCircle, LogOut } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat?: () => void;
}

export default function Header({ onToggleSidebar, onNewChat }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overflowOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (overflowRef.current?.contains(target)) return;
      setOverflowOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [overflowOpen]);

  const handleSignOut = async () => {
    setOverflowOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  const handleLogoClick = () => {
    console.log('[Header] handleLogoClick fired, pathname:', pathname);
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const iconButtonClass =
    'rounded p-2.5 text-zinc-400 transition-colors duration-200 hover:bg-[#1a1a1a] hover:text-[#f5f5f5] min-w-[44px] min-h-[44px] flex items-center justify-center';

  return (
    <header className="flex h-14 items-center border-b border-[#2a2a2a] bg-[#111111] px-4">
      <button
        onClick={onToggleSidebar}
        className={`${iconButtonClass} mr-4`}
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

      <button
        type="button"
        onClick={handleLogoClick}
        className="flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#16a34a]/50 focus:ring-offset-2 focus:ring-offset-[#111111] rounded min-h-[44px] min-w-[44px]"
        aria-label="1Yes home"
      >
        <Image
          src="/logo/1y-logo.png"
          alt="1Yes"
          width={96}
          height={32}
          className="pointer-events-none select-none"
        />
      </button>

      <div className="ml-auto flex items-center gap-1">
        {onNewChat && (
          <button
            onClick={onNewChat}
            className={iconButtonClass}
            aria-label="New chat"
          >
            <SquarePen className="h-5 w-5" />
          </button>
        )}

        <div className="relative" ref={overflowRef}>
          <button
            onClick={() => setOverflowOpen((v) => !v)}
            className={iconButtonClass}
            aria-label="Menu"
            aria-expanded={overflowOpen}
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {overflowOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] py-1 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                disabled
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-500 cursor-not-allowed"
                role="menuitem"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <button
                type="button"
                disabled
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-500 cursor-not-allowed"
                role="menuitem"
              >
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-[#2a2a2a] hover:text-[#f5f5f5]"
                role="menuitem"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
