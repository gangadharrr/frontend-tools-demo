import { useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useToolContext } from '../contexts/ToolContext';
import { AskQuestionTool } from './tools/ask-question/ask-question-tool';
import type { UIToolCallEntry } from '../types';

export function ChatContainer() {
  const { getToolMetadata, getTool } = useToolContext();
  const { entries, isLoading, error, sendMessage, stop, resumeAgent, updateEntry } = useChat({
    getToolMetadata,
    getTool,
  });

  const handleToolSubmit = useCallback(
    (entry: UIToolCallEntry, result: Record<string, unknown>) => {
      const tool = getTool(entry.name);
      if (!tool) return;

      // Persist the structured submission on the entry *immediately* so the
      // `responded` renderer can read it. This survives the round-trip to
      // the backend (the backend's TOOL_CALL_RESULT must not overwrite it).
      updateEntry(entry.id, { result });

      const commandResponse = tool.handle(entry.args as never, result as never);
      resumeAgent(commandResponse);
    },
    [getTool, resumeAgent, updateEntry],
  );

  return (
    <div className="flex h-screen flex-col bg-[var(--page)]">
      {/* Tool self-registration side effects. */}
      <AskQuestionTool />

      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--page)]">
        <div className="mx-auto flex h-12 max-w-3xl items-center px-4" />
      </header>

      {error && (
        <div className="shrink-0 border-b border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-2">
          <p className="mx-auto max-w-3xl text-sm text-[var(--error-text)]">{error}</p>
        </div>
      )}

      <MessageList entries={entries} isLoading={isLoading} onToolSubmit={handleToolSubmit} />

      <ChatInput onSend={sendMessage} onStop={stop} isLoading={isLoading} />
    </div>
  );
}
