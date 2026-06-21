import { useState } from 'react';
import { ChevronDown, Brain } from 'lucide-react';
import type { UserMessage, AssistantMessage } from '../types';

interface MessageBubbleProps {
  message: UserMessage | AssistantMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.kind === 'user';
  const [showThinking, setShowThinking] = useState(false);

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-2xl bg-[var(--user-bubble)] px-4 py-2.5">
          <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[75%]">
        {message.thinking && (
          <div className="mb-2 rounded-lg border border-[var(--tool-border)] bg-[var(--tool-bg)] overflow-hidden">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <Brain className="size-3.5 shrink-0" />
              <span>Thinking</span>
              <ChevronDown
                className="size-3.5 ml-auto transition-transform duration-150"
                style={{ transform: showThinking ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>
            {showThinking && (
              <div className="border-t border-[var(--tool-border)] px-3 py-2 text-xs text-[var(--muted)] leading-relaxed whitespace-pre-wrap">
                {message.thinking}
              </div>
            )}
          </div>
        )}
        {message.content ? (
          <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : isStreaming ? (
          <div className="flex items-center gap-1 py-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
