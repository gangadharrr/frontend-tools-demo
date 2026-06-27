import { useRef, useState } from 'react';
import { ChevronDown, Brain } from 'lucide-react';
import type { UserMessage, AssistantMessage } from '../types';
import { TypingDots } from './TypingDots';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

interface MessageBubbleProps {
  message: UserMessage | AssistantMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.kind === 'user';
  const [showThinking, setShowThinking] = useState(false);
  const userHasToggledRef = useRef(false);
  const hasThinkingStarted = !isUser && message.thinking !== undefined;

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

  const handleOpenChange = (open: boolean) => {
    userHasToggledRef.current = true;
    setShowThinking(open);
  };

  return (
    <div className="flex justify-start">
      <div className="max-w-[75%]">
        {hasThinkingStarted && (
          <Collapsible
            open={showThinking}
            onOpenChange={handleOpenChange}
            className="mb-2 rounded-lg border border-[var(--tool-border)] bg-[var(--tool-bg)] overflow-hidden"
          >
            <CollapsibleTrigger className="group flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <Brain className="size-3.5 shrink-0" />
              <span>Thinking</span>
              <ChevronDown className="size-3.5 ml-auto transition-transform duration-150 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-[var(--tool-border)] px-3 py-2 text-xs text-[var(--muted)] leading-relaxed whitespace-pre-wrap">
              {message.thinking ? (
                message.thinking
              ) : (
                <span className="italic opacity-70">Thinking…</span>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
        {message.content ? (
          <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : isStreaming ? (
          <TypingDots label="Assistant is typing" />
        ) : null}
      </div>
    </div>
  );
}
