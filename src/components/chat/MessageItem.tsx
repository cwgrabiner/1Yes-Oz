'use client';

import { useState } from 'react';
import type { Message } from '@/lib/chat/types';
import { parseMemoryCandidates, stripMemoryMarkers } from '@/lib/memory/parse';
import MemoryConsentChip from './MemoryConsentChip';

interface MessageItemProps {
  message: Message;
  messageIndex: number;
  messageCount: number;
  isLoading?: boolean;
  onRememberMemory?: (candidate: { key: string; value: string }) => Promise<void>;
  onToolLaunch?: (toolName: string) => void;
  onEntryPromptSelect?: (text: string) => void;
}

export default function MessageItem({ message, messageIndex, messageCount, isLoading = false, onRememberMemory, onToolLaunch, onEntryPromptSelect }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const [dismissedCandidates, setDismissedCandidates] = useState<Set<string>>(new Set());
  const [jobSearchLayer1Selected, setJobSearchLayer1Selected] = useState<string | null>(null);
  const [entryLayer2Selected, setEntryLayer2Selected] = useState<string | null>(null);
  const [jobSearchEntryDismissed, setJobSearchEntryDismissed] = useState(false);

  const isLastMessage = messageIndex === messageCount - 1;
  const toolName = message.toolResult?.toolName;
  const hasEntryPrompts = (toolName === 'jobseeker_operations' || toolName === 'interview_prep' || toolName === 'linkedin_presence' || toolName === 'resumes' || toolName === 'confidence_builder' || toolName === 'negotiations' || toolName === 'networking') && message.toolResult?.entryPrompts;
  const entryPrompts = isAssistant && hasEntryPrompts ? message.toolResult!.entryPrompts! : null;
  const showEntryGuidance =
    entryPrompts &&
    isLastMessage &&
    !isLoading &&
    !jobSearchEntryDismissed &&
    !!onEntryPromptSelect;
  const layer2Prefix = toolName === 'jobseeker_operations' ? ' Base it on: ' : ' Start from: ';
  const hasLayer3 = entryPrompts && 'layer3' in entryPrompts && entryPrompts.layer3;
  const showingLayer3 = hasLayer3 && jobSearchLayer1Selected && entryLayer2Selected;
  const showingLayer2 = jobSearchLayer1Selected && !showingLayer3;

  // Render system messages (e.g., "Saved: {value}") but with muted styling
  if (message.role === 'system') {
    return (
      <div className="flex justify-center">
        <div className="rounded-lg bg-[#1a1a1a]/40 px-4 py-2 text-xs text-zinc-400">
          {message.content}
        </div>
      </div>
    );
  }

  // Parse memory candidates from assistant messages
  const memoryCandidates = isAssistant ? parseMemoryCandidates(message.content) : [];
  const displayText = stripMemoryMarkers(message.content);

  // Get proposed memory writes from toolResult if present
  const toolMemoryWrites = message.toolResult?.proposedMemoryWrites || [];

  // Filter out dismissed candidates
  const activeCandidates = memoryCandidates.filter(
    (candidate) => !dismissedCandidates.has(`${candidate.key}:${candidate.value}`)
  );

  // Filter out dismissed tool memory writes
  const activeToolMemoryWrites = toolMemoryWrites.filter(
    (write) => !dismissedCandidates.has(`${write.key}:${write.value}`)
  );

  const handleDismiss = (candidate: { key: string; value: string }) => {
    setDismissedCandidates((prev) => new Set(prev).add(`${candidate.key}:${candidate.value}`));
  };

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      style={{
        animation: 'fadeIn 0.3s ease-in',
      }}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'ml-auto border-l-4 border-green-500 bg-green-950/20 text-[#f5f5f5]'
            : 'mr-auto bg-zinc-900/50 text-[#f5f5f5]'
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {displayText}
        </div>
        {/* Show consent chip for first active candidate only */}
        {isAssistant && activeCandidates.length > 0 && onRememberMemory && (
          <MemoryConsentChip
            candidate={activeCandidates[0]}
            onRemember={onRememberMemory}
            onDismiss={() => handleDismiss(activeCandidates[0])}
          />
        )}
        {/* Show consent chips for tool-proposed memory writes */}
        {isAssistant && activeToolMemoryWrites.length > 0 && onRememberMemory && (
          <div className="mt-2 space-y-2">
            {activeToolMemoryWrites.map((write, idx) => (
              <MemoryConsentChip
                key={`${write.key}:${write.value}:${idx}`}
                candidate={{ key: write.key, value: write.value }}
                onRemember={onRememberMemory}
                onDismiss={() => handleDismiss({ key: write.key, value: write.value })}
              />
            ))}
          </div>
        )}
        {/* Wizard offer button (e.g. Start Résumé Makeover) when router detects high intent */}
        {isAssistant && message.wizardOffer && onToolLaunch && isLastMessage && !isLoading && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onToolLaunch(message.wizardOffer!)}
              className="inline-flex items-center gap-2 rounded-lg border-2 border-green-600 bg-green-600/10 px-4 py-2.5 text-sm font-semibold text-green-500 hover:bg-green-600 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Start Résumé Makeover
            </button>
          </div>
        )}
        {/* Guided entry for Job Search, Interview Prep, LinkedIn, Confidence Builder, Salary Negotiation, Networking (2 layers) & Resume Makeover (3 layers). Disappears on selection or when user types. */}
        {showEntryGuidance && entryPrompts && (
          <div className="mt-4 flex flex-col gap-3">
            {!jobSearchLayer1Selected ? (
              <>
                <p className="text-xs font-medium text-zinc-400">{entryPrompts.layer1.intro}</p>
                <div className="flex flex-col gap-2">
                  {entryPrompts.layer1.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setJobSearchLayer1Selected(opt)}
                      className="w-full max-w-md rounded-xl border border-[#16a34a]/30 bg-[#0a0a0a] px-4 py-2.5 text-left text-sm text-zinc-300 transition-all hover:border-[#16a34a]/80 hover:text-white hover:shadow-[0_0_12px_rgba(22,163,74,0.25)] focus:outline-none focus:border-[#16a34a] focus:shadow-[0_0_16px_rgba(22,163,74,0.3)]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            ) : showingLayer3 && entryPrompts.layer3 ? (
              <>
                <p className="text-xs font-medium text-zinc-400">{entryPrompts.layer3.intro}</p>
                <div className="flex flex-col gap-2">
                  {entryPrompts.layer3.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setJobSearchEntryDismissed(true);
                        onEntryPromptSelect?.(`${jobSearchLayer1Selected}.${layer2Prefix}${entryLayer2Selected}. Approach: ${opt}`);
                      }}
                      className="w-full max-w-md rounded-xl border border-[#16a34a]/30 bg-[#0a0a0a] px-4 py-2.5 text-left text-sm text-zinc-300 transition-all hover:border-[#16a34a]/80 hover:text-white hover:shadow-[0_0_12px_rgba(22,163,74,0.25)] focus:outline-none focus:border-[#16a34a] focus:shadow-[0_0_16px_rgba(22,163,74,0.3)]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            ) : showingLayer2 ? (
              <>
                <p className="text-xs font-medium text-zinc-400">{entryPrompts.layer2.intro}</p>
                <div className="flex flex-col gap-2">
                  {entryPrompts.layer2.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (hasLayer3) {
                          setEntryLayer2Selected(opt);
                        } else {
                          setJobSearchEntryDismissed(true);
                          onEntryPromptSelect?.(`${jobSearchLayer1Selected}.${layer2Prefix}${opt}`);
                        }
                      }}
                      className="w-full max-w-md rounded-xl border border-[#16a34a]/30 bg-[#0a0a0a] px-4 py-2.5 text-left text-sm text-zinc-300 transition-all hover:border-[#16a34a]/80 hover:text-white hover:shadow-[0_0_12px_rgba(22,163,74,0.25)] focus:outline-none focus:border-[#16a34a] focus:shadow-[0_0_16px_rgba(22,163,74,0.3)]"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
