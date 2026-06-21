import { type FormEvent, type KeyboardEvent, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value.trim();
    if (!value || isLoading) return;
    onSend(value);
    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.style.removeProperty('height');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function autoResize() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  return (
    <form onSubmit={handleSubmit} className="shrink-0 border-t border-[var(--border)] bg-[var(--page)]">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 shadow-sm transition-shadow duration-150 focus-within:shadow-md focus-within:border-[var(--primary)]/30">
          <textarea
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onInput={autoResize}
            placeholder="Type a message..."
            rows={1}
            className="min-h-[24px] max-h-[200px] flex-1 resize-none bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none leading-relaxed"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--foreground)] p-1.5 text-[var(--inverse-text)] hover:opacity-90 transition-opacity"
            >
              <Square className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--foreground)] p-1.5 text-[var(--inverse-text)] hover:opacity-90 transition-opacity"
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
