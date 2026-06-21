import { useEffect, useRef } from 'react';
import type { ConversationEntry } from '../types';
import { MessageBubble } from './MessageBubble';
import { ToolCallCard } from './ToolCallCard';

interface MessageListProps {
  entries: ConversationEntry[];
  isLoading: boolean;
}

export function MessageList({ entries, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const lastEntry = entries[entries.length - 1];
  const isLastStreaming = isLoading && lastEntry?.kind === 'assistant';

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
            <p className="text-sm text-[var(--muted)] max-w-sm">
              Send a message to start a conversation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, i) => {
              if (entry.kind === 'user' || entry.kind === 'assistant') {
                return (
                  <div key={entry.id} className="animate-fade-in">
                    <MessageBubble
                      message={entry}
                      isStreaming={entry.kind === 'assistant' && isLastStreaming && i === entries.length - 1}
                    />
                  </div>
                );
              }

              if (entry.kind === 'tool_call') {
                return (
                  <div key={entry.id} className="animate-fade-in">
                    <ToolCallCard tool={entry} />
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
