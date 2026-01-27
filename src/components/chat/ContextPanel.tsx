'use client';

import { useState, useRef } from 'react';
import { FileText, Upload } from 'lucide-react';
import type { PromptContextSlots } from '@/lib/prompt/buildPrompt';

interface ContextPanelProps {
  slots: PromptContextSlots;
  onSlotsChange: (slots: PromptContextSlots) => void;
}

export default function ContextPanel({ slots, onSlotsChange }: ContextPanelProps) {
  // Local draft state for pasted text - independent of slots
  const [pasteDraft, setPasteDraft] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/oz/ingest', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setUploadError(data.error);
        return;
      }

      if (data.text) {
        onSlotsChange({
          ...slots,
          careerFileText: data.text,
        });
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

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
    setUploadError(null);
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

      {/* File Upload */}
      <div className="space-y-2">
        <label className="block text-xs text-zinc-400">Upload File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`flex items-center justify-center gap-2 w-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-700 bg-[#1a1a1a] px-3 py-3 text-xs text-zinc-300 transition-all duration-200 ${
            isUploading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-green-500 hover:bg-[#1a1a1a]/80'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload file'}</span>
        </label>
        <p className="text-xs text-zinc-500">PDF, DOCX, TXT, or MD (max 10MB)</p>
        {uploadError && (
          <p className="text-xs text-red-400">{uploadError}</p>
        )}
        {slots.careerFileText && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <FileText className="w-3 h-3" />
            <span>File attached</span>
          </div>
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
