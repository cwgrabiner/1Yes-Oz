'use client';

import { useState } from 'react';

interface WizardArtifactProps {
  artifact: string;
  displayName: string;
  onClose: () => void;
}

export function WizardArtifact({ artifact, displayName, onClose }: WizardArtifactProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(artifact);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-green-700/50 bg-zinc-900/80 p-3 sm:p-5 my-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium text-green-500 uppercase tracking-wider">✓ Complete</span>
          <h3 className="text-sm font-semibold text-white mt-0.5">{displayName} — Finished</h3>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xs">Done</button>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 sm:p-4 overflow-hidden">
        <pre className="text-xs sm:text-sm text-zinc-200 whitespace-pre-wrap font-mono leading-relaxed overflow-auto max-h-96 break-words">
          {artifact}
        </pre>
      </div>

      <button
        onClick={handleCopy}
        className="w-full rounded-lg border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
      >
        {copied ? '✓ Copied!' : 'Copy to clipboard'}
      </button>

      <p className="text-xs text-zinc-500 text-center">
        Paste into Word, Google Docs, or any text editor
      </p>

      <p className="text-xs text-zinc-600 text-center mt-3 pt-3 border-t border-zinc-800">
        Built using Melissa Grabiner&apos;s résumé framework • 1Yes.ai
      </p>
    </div>
  );
}
