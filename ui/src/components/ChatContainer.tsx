import { useCallback } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useToolContext } from '../contexts/ToolContext';
import { AskQuestionTool } from './tools/ask-question/ask-question-tool';
import { RequestColorTool } from './tools/color-picker/request-color-tool';
import type { UIToolCallEntry } from '../types';
import z from 'zod';
import { useTool } from '../hooks/useTool';
import { Button } from './ui/button';
import { StatusBadge } from './ui/status-badge';

const confirmActionSchema = z.object({
  message: z.string().describe('What the user is confirming'),
});

export function ChatContainer() {
  const { getToolMetadata, getTool } = useToolContext();
  const { entries, isLoading, error, sendMessage, stop, resumeAgent, updateEntry } = useChat({
    getToolMetadata,
    getTool,
  });
  
  useTool<z.infer<typeof confirmActionSchema>, { confirmed: boolean }>({
    name: 'confirm_action',
    description: 'Ask the user to confirm before performing a risky action.',
    schema: confirmActionSchema,
    render: {
      // 1. STREAMING — args are still arriving; message may be partial or undefined.
      streaming: () => (
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--muted)' }}>
          <Loader2 className="size-3 animate-spin" />
          <span>{'Preparing confirmation UI...'}</span>
        </div>
      ),

      // 2. WAITING FOR INPUT — full args received, show the interactive dialog.
      waitingForInput: ({ args, onSubmit }) => (
        <div className="flex flex-col gap-2 font-bold">
          <p className="text-sm" style={{ color: 'var(--foreground)' }}>{args.message}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => onSubmit({ confirmed: true })}>
              Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSubmit({ confirmed: false })}>
              Cancel
            </Button>
          </div>
        </div>
      ),

      // 3. RESPONDED — user has submitted, show the final outcome.
      responded: ({ result }) =>
        result?.confirmed ? (
          <StatusBadge icon={CheckCircle2} tone="success">Confirmed</StatusBadge>
        ) : (
          <StatusBadge icon={XCircle} tone="muted">Cancelled</StatusBadge>
        ),

      // 4. REJECTED — user sent a new chat message while this was still pending.
      rejected: ({ args }) => (
        <StatusBadge icon={XCircle} tone="muted">Skipped: {args.message}</StatusBadge>
      ),
    },
    handle: (_args, result) => ({
      externalToolResponse: result.confirmed ? 'success' : 'failure',
      successMessage: 'User confirmed the action.',
      failureMessage: 'User declined the action.',
    }),
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
      <RequestColorTool />

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
