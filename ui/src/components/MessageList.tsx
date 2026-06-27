import { useCallback, useEffect, useRef } from 'react';
import type {
  ConversationEntry,
  UIToolCallEntry,
  ToolDefinition,
  UIToolStatus,
} from '../types';
import { MessageBubble } from './MessageBubble';
import { ToolCallCard } from './ToolCallCard';
import { TypingDots } from './TypingDots';
import { useToolContext } from '../contexts/ToolContext';

interface MessageListProps {
  entries: ConversationEntry[];
  isLoading: boolean;
  onToolSubmit: (entry: UIToolCallEntry, result: Record<string, unknown>) => void;
}

export function MessageList({ entries, isLoading, onToolSubmit }: MessageListProps) {
  const { getTool } = useToolContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const lastEntry = entries[entries.length - 1];
  const isLastStreaming = isLoading && lastEntry?.kind === 'assistant';

  const handleToolSubmit = useCallback((entry: UIToolCallEntry, result: Record<string, unknown>) => {
    onToolSubmit(entry, result);
  }, [onToolSubmit]);

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
              } else if (entry.kind === 'tool_call') {
                return (
                  <div key={entry.id} className="animate-fade-in">
                    <ToolCallCard tool={entry} />
                  </div>
                );
              } else if (entry.kind === 'ui_tool_call') {
                return (
                  <div key={entry.id} className="animate-fade-in">
                    <UIToolCallCard
                      entry={entry}
                      onSubmit={(result) => handleToolSubmit(entry, result)}
                      getTool={getTool}
                    />
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

interface UIToolCallCardProps {
  entry: UIToolCallEntry;
  onSubmit: (result: Record<string, unknown>) => void;
  getTool: (name: string) => ToolDefinition | undefined;
}

/**
 * Dispatches to the tool's renderer for the entry's current lifecycle phase.
 * Falls back to a generic chrome + header if the tool isn't registered
 * (e.g. a stale session) or the tool doesn't provide a renderer for the phase.
 */
function UIToolCallCard({ entry, onSubmit, getTool }: UIToolCallCardProps) {
  const tool = getTool(entry.name);

  if (!tool) {
    return (
      <div className="p-2 text-xs text-red-500">
        Tool not found: {entry.name}
      </div>
    );
  }

  // Pick the right renderer for the current phase.
  const Renderer = pickRenderer(tool, entry.status);

  return Renderer ? (
    <Renderer
      // Re-mount on entry id change so internal component state resets between tool calls.
      key={entry.id}
      args={entry.args as never}
      argsRaw={entry.argsRaw}
      onSubmit={onSubmit}
      result={entry.result as never}
      outcome={entry.outcome ?? 'success'}
    />
  ) : (
    <FallbackBody entry={entry} />

  );
}

/**
 * Resolve the appropriate renderer from the tool definition for a given status.
 * `streaming` is optional — fall back to a generic placeholder if absent.
 */
function pickRenderer(
  tool: ToolDefinition,
  status: UIToolStatus,
):
  | React.ComponentType<{
    args: Record<string, unknown>;
    argsRaw?: string;
    onSubmit: (result: Record<string, unknown>) => void;
    result?: Record<string, unknown>;
    outcome: 'success' | 'cancelled' | 'failure' | 'error';
  }>
  | undefined {
  switch (status) {
    case 'streaming':
      return tool.render.streaming as never;
    case 'waiting_for_input':
      return tool.render.waitingForInput as never;
    case 'responded':
      return tool.render.responded as never;
    default:
      return undefined;
  }
}

/**
 * Shown when a tool doesn't provide a renderer for the current phase,
 * or when the entry has no args yet.
 */
function FallbackBody(_: { entry: UIToolCallEntry }) {
  return <TypingDots label="Tool loading" />;
}
