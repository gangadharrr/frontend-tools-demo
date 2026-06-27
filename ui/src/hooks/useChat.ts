import { useState, useRef, useCallback } from 'react';
import type {
  ConversationEntry,
  UserMessage,
  AssistantMessage,
  ToolCallEntry,
  UIToolCallEntry,
  ToolMetadata,
  ToolDefinition,
  UIToolStatus,
} from '../types';
import { streamChat } from '../api/chat';
import { extractThinking } from '../utils/extract-think';

let idCounter = 0;

function uid(): string {
  return `e-${++idCounter}`;
}

function userMsg(content: string): UserMessage {
  return { kind: 'user', id: uid(), content, timestamp: new Date() };
}

function assistantMsg(content: string): AssistantMessage {
  return { kind: 'assistant', id: uid(), content, timestamp: new Date() };
}

function toolCallEntry(name: string): ToolCallEntry {
  return { kind: 'tool_call', id: uid(), name, args: null, status: 'running', timestamp: new Date() };
}

function uiToolStreamingEntry(
  name: string,
  toolCallId: string,
  args: Record<string, unknown>,
  argsRaw: string,
): UIToolCallEntry {
  return {
    kind: 'ui_tool_call',
    id: uid(),
    name,
    toolCallId,
    args,
    argsRaw,
    status: 'streaming',
    timestamp: new Date(),
  };
}

function parseArgs(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function appendAIText(entries: ConversationEntry[], text: string): AssistantMessage {
  const last = entries[entries.length - 1];
  if (last?.kind === 'assistant') {
    const raw = last.content + text;
    const { clean, thinking } = extractThinking(raw);
    const updated: AssistantMessage = thinking !== undefined
      ? { ...last, content: clean, thinking }
      : { ...last, content: clean };
    entries[entries.length - 1] = updated;
    return updated;
  }
  const raw = text;
  const { clean, thinking } = extractThinking(raw);
  const msg = assistantMsg(clean);
  if (thinking !== undefined) msg.thinking = thinking;
  entries.push(msg);
  return msg;
}

function findLastToolCall(arr: ConversationEntry[]): ToolCallEntry | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i].kind === 'tool_call') return arr[i] as ToolCallEntry;
  }
  return undefined;
}

function findLastPendingUIToolCall(arr: ConversationEntry[]): UIToolCallEntry | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const entry = arr[i];
    if (
      entry.kind === 'ui_tool_call' &&
      entry.status !== 'responded' &&
      entry.status !== 'rejected'
    ) {
      return entry;
    }
  }
  return undefined;
}

/**
 * Mark any in-flight tool calls as `rejected`.
 *
 * Invoked when the user sends a new chat message while a tool is still
 * pending — that chat message supersedes the tool, so the pending tool
 * should render its `rejected` UI instead of remaining "waiting".
 *
 * - Backend tools in `running` → `rejected`
 * - Frontend tools in `streaming` or `waiting_for_input` → `rejected`
 * - Anything already terminal (`complete`, `responded`, `rejected`) is left alone.
 */
function rejectPendingTools(entries: ConversationEntry[]): ConversationEntry[] {
  return entries.map(entry => {
    if (entry.kind === 'tool_call' && entry.status === 'running') {
      return { ...entry, status: 'rejected' };
    }
    if (
      entry.kind === 'ui_tool_call' &&
      (entry.status === 'streaming' || entry.status === 'waiting_for_input')
    ) {
      return { ...entry, status: 'rejected' };
    }
    return entry;
  });
}

function findUIToolCallByToolId(arr: ConversationEntry[], toolId: string): UIToolCallEntry | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const entry = arr[i];
    if (entry.kind === 'ui_tool_call' && entry.toolId === toolId) return entry;
  }
  return undefined;
}

function findUIToolCallByToolCallId(
  arr: ConversationEntry[],
  toolCallId: string,
): UIToolCallEntry | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const entry = arr[i];
    if (entry.kind === 'ui_tool_call' && entry.toolCallId === toolCallId) return entry;
  }
  return undefined;
}

function findStreamingUIToolCall(arr: ConversationEntry[], name: string): UIToolCallEntry | undefined {
  for (let i = arr.length - 1; i >= 0; i--) {
    const entry = arr[i];
    if (entry.kind === 'ui_tool_call' && entry.status === 'streaming' && entry.name === name) {
      return entry;
    }
  }
  return undefined;
}

function inferOutcome(
  raw: string | undefined,
): 'success' | 'cancelled' | 'failure' | 'error' {
  if (!raw) return 'success';
  const s = raw.toLowerCase();
  if (s.includes('cancel')) return 'cancelled';
  if (s.includes('error')) return 'error';
  if (s.includes('failure') || s.includes('failed')) return 'failure';
  return 'success';
}

interface UseChatOptions {
  getToolMetadata?: () => ToolMetadata[];
  /**
   * Auto-detect whether a tool name belongs to a frontend-registered tool.
   * If not provided, all tools are treated as backend tools (no UI rendering).
   */
  getTool?: (name: string) => ToolDefinition | undefined;
}

export function useChat(options: UseChatOptions = {}) {
  const { getToolMetadata, getTool } = options;
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadIdRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

  const isFrontendTool = useCallback(
    (name: string) => Boolean(getTool?.(name)),
    [getTool],
  );

  const processEvents = useCallback(async (
    request: { message?: string; commandResponse?: Record<string, unknown> },
  ) => {
    const abortController = new AbortController();
    abortRef.current = abortController;

    // Backend tool args accumulator (for non-frontend tools)
    const toolArgsMap = new Map<string, string>();
    const toolIndexMap = new Map<number, ToolCallEntry>();
    // Frontend tool streaming accumulator — keyed by toolCallId (backend chunk id)
    const uiToolRawByCallId = new Map<string, string>();

    const frontendTools = getToolMetadata?.();

    try {
      for await (const event of streamChat(
        { ...request, threadId: threadIdRef.current, frontendTools },
        abortController.signal,
      )) {
        if (event.eventType === 'RUN_STARTED') {
          const data = event.eventData as Record<string, unknown>;
          if (data.threadId) threadIdRef.current = data.threadId as string;
        } else if (event.eventType === 'TEXT_MESSAGE_CONTENT') {
          const text = (event.eventData as Record<string, unknown>).aiMessage as string ?? '';
          if (!text) continue;
          setEntries(prev => {
            const updated = [...prev];
            appendAIText(updated, text);
            return updated;
          });
        } else if (event.eventType === 'TOOL_CALL_ARGS') {
          const data = event.eventData as Record<string, unknown>;
          const text = data.aiMessage as string ?? '';

          if (text) {
            setEntries(prev => {
              const updated = [...prev];
              appendAIText(updated, text);
              return updated;
            });
          }

          const chunks = data.toolCallChunks as
            | Array<{ name?: string; id?: string; args?: string; index?: number }>
            | undefined;

          if (chunks) {
            setEntries(prev => {
              const updated = [...prev];
              for (const chunk of chunks) {
                const idx = chunk.index ?? 0;
                const name = chunk.name ?? 'tool';
                const chunkId = chunk.id ?? `i:${idx}`;

                // AUTO-DETECT: if this name is a registered frontend tool, route to UI pipeline.
                if (isFrontendTool(name)) {
                  const accumulated = (uiToolRawByCallId.get(chunkId) ?? '') + (chunk.args ?? '');
                  uiToolRawByCallId.set(chunkId, accumulated);
                  const parsed = parseArgs(accumulated) ?? {};

                  let entry = findUIToolCallByToolCallId(updated, chunkId);
                  if (!entry) {
                    // First chunk for this frontend tool call — create streaming entry.
                    entry = uiToolStreamingEntry(name, chunkId, parsed, accumulated);
                    updated.push(entry);
                  } else {
                    entry.args = parsed;
                    entry.argsRaw = accumulated;
                  }
                  continue;
                }

                // Backend tool path (unchanged).
                if (!toolIndexMap.has(idx)) {
                  const entry = toolCallEntry(name);
                  toolIndexMap.set(idx, entry);
                  updated.push(entry);
                }

                if (chunk.args) {
                  const accumulated = (toolArgsMap.get(`i:${idx}`) ?? '') + chunk.args;
                  toolArgsMap.set(`i:${idx}`, accumulated);

                  const entry = toolIndexMap.get(idx);
                  if (entry) {
                    entry.argsRaw = accumulated;
                    const parsed = parseArgs(accumulated);
                    if (parsed) entry.args = parsed;
                  }
                }
              }
              return updated;
            });
          }
        } else if (event.eventType === 'TOOL_CALL_RESULT') {
          const toolMessage = (event.eventData as Record<string, unknown>).toolMessage as string ?? '';

          setEntries(prev => {
            const updated = [...prev];
            const pendingUI = findLastPendingUIToolCall(updated);
            if (pendingUI) {
              const idx = updated.indexOf(pendingUI);
              const newOutcome = inferOutcome(toolMessage);
              // IMPORTANT: Preserve any structured result already set by the submit
              // handler (e.g. { answers, cancelled, success }). Only fall back to
              // a plain `{ message }` if the renderer didn't supply one — that way
              // the user's submission survives the round-trip to the backend.
              const preservedResult = pendingUI.result;
              updated[idx] = {
                ...pendingUI,
                status: 'responded',
                outcome: newOutcome,
                result: preservedResult ?? (toolMessage ? { message: toolMessage } : undefined),
              };
              return updated;
            }
            const lastTool = findLastToolCall(updated);
            if (lastTool) {
              lastTool.status = 'complete';
              if (toolMessage) lastTool.result = toolMessage;
            }
            return updated;
          });
        } else if (event.eventType === 'CUSTOM' && event.customEventName === 'EXTERNAL_TOOL_CALL') {
          const data = event.eventData as Record<string, unknown>;
          const toolName = data.toolName as string;
          const toolId = data.toolId as string;
          const toolArgs = (data.toolArgs as Record<string, unknown>) ?? {};

          setEntries(prev => {
            const updated = [...prev];

            // 1. Try to find existing entry by toolId (some backends set it early).
            let entry = toolId ? findUIToolCallByToolId(updated, toolId) : undefined;

            // 2. Fallback: find the most recent streaming entry for this tool name.
            if (!entry) entry = findStreamingUIToolCall(updated, toolName);

            const nextStatus: UIToolStatus = 'waiting_for_input';

            if (entry) {
              const idx = updated.indexOf(entry);
              updated[idx] = {
                ...entry,
                status: nextStatus,
                toolId: toolId ?? entry.toolId,
                args: { ...entry.args, ...toolArgs }, // merge — prefer freshest from backend
              };
              return updated;
            }

            // 3. No streaming phase observed — backend jumped straight to EXTERNAL_TOOL_CALL.
            updated.push({
              kind: 'ui_tool_call',
              id: uid(),
              name: toolName,
              toolId,
              args: toolArgs,
              status: nextStatus,
              timestamp: new Date(),
            });
            return updated;
          });
          // Do NOT return here — the backend may still emit text/tool_call_result for this round.
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      throw err;
    } finally {
      abortRef.current = null;
    }
  }, [getToolMetadata, isFrontendTool]);

  const sendMessage = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setError(null);
    setIsLoading(true);

    // A new chat message supersedes any in-flight tool — mark pending tools
    // as rejected so their `rejected` renderer takes over.
    setEntries(prev => {
      const rejected = rejectPendingTools(prev);
      return [...rejected, userMsg(trimmed)];
    });

    try {
      await processEvents({ message: trimmed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      setEntries(prev => prev.slice(0, -2));
    } finally {
      setIsLoading(false);
    }
  }, [processEvents]);

  const resumeAgent = useCallback(async (commandResponse: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);

    try {
      await processEvents({ commandResponse });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [processEvents]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    setError(null);
    threadIdRef.current = undefined;
    idCounter = 0;
  }, []);

  /**
   * Patch an existing entry in-place. Used by the parent to attach structured
   * submission data (e.g. `{ answers, cancelled }`) to a UI tool call so the
   * `responded` renderer can read it. No-op if no entry matches the id.
   */
  const updateEntry = useCallback(
    (id: string, patch: Partial<UIToolCallEntry>) => {
      setEntries(prev => {
        const idx = prev.findIndex(e => e.id === id);
        if (idx === -1) return prev;
        const next = [...prev];
        const existing = next[idx];
        if (existing.kind !== 'ui_tool_call') return prev;
        next[idx] = { ...existing, ...patch } as UIToolCallEntry;
        return next;
      });
    },
    [],
  );

  return { entries, isLoading, error, sendMessage, stop, clear, resumeAgent, updateEntry };
}
