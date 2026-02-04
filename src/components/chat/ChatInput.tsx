'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Paperclip, SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  onUpload?: (file: File) => void;
}

export default function ChatInput({ onSend, disabled = false, onUpload }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  const handleSubmit = () => {
    if (content.trim() && !disabled) {
      onSend(content);
      setContent('');
      // Reset textarea height after clearing
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      // Keep focus in input after sending
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const hasContent = content.trim().length > 0;
  const showSendButton = hasContent || !disabled;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative flex items-end gap-2 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-3 focus-within:border-[#16a34a]/50 focus-within:ring-2 focus-within:ring-green-500/50 focus-within:shadow-lg focus-within:shadow-green-500/20 transition-all duration-200">
        {/* Hidden file input */}
        {onUpload && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
            id="chat-file-upload"
          />
        )}
        
        {/* Upload icon button (left) */}
        {onUpload && (
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={disabled || isUploading}
            className="flex-shrink-0 p-2.5 text-zinc-400 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Upload file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 resize-none overflow-hidden bg-transparent text-[#f5f5f5] placeholder-zinc-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed py-2 px-1"
          placeholder={disabled ? 'Sending...' : 'Type your message or choose one of the options below...'}
          rows={1}
          style={{
            minHeight: '44px',
            maxHeight: '200px',
          }}
        />

        {/* Send icon button (right) */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !hasContent}
          className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            hasContent && !disabled
              ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30'
              : 'text-zinc-400 hover:text-zinc-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label="Send message"
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
