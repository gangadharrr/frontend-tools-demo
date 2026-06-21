import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export function ChatContainer() {
  const { entries, isLoading, error, sendMessage, stop } = useChat();

  return (
    <div className="flex h-screen flex-col bg-[var(--page)]">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--page)]">
        <div className="mx-auto flex h-12 max-w-3xl items-center px-4" />
      </header>

      {error && (
        <div className="shrink-0 border-b border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-2">
          <p className="mx-auto max-w-3xl text-sm text-[var(--error-text)]">{error}</p>
        </div>
      )}

      <MessageList entries={entries} isLoading={isLoading} />

      <ChatInput onSend={sendMessage} onStop={stop} isLoading={isLoading} />
    </div>
  );
}
