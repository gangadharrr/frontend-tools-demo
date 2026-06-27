export interface ToolCallChunk {
  name?: string;
  args?: string;
  id?: string;
  index?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface UserMessage {
  kind: 'user';
  id: string;
  content: string;
  timestamp: Date;
}

export interface AssistantMessage {
  kind: 'assistant';
  id: string;
  content: string;
  thinking?: string;
  timestamp: Date;
}

export interface ToolCallEntry {
  kind: 'tool_call';
  id: string;
  name: string;
  args: Record<string, unknown> | null;
  argsRaw?: string;
  status: 'running' | 'complete';
  result?: string;
  timestamp: Date;
}

/**
 * Lifecycle states for a frontend (UI) tool call.
 *
 * - streaming        : Args are streaming in via TOOL_CALL_ARGS. Partial data.
 * - waiting_for_input: Full args received + EXTERNAL_TOOL_CALL fired. Awaiting user action.
 * - responded        : User has submitted (or cancelled). Result is final.
 */
export type UIToolStatus = 'streaming' | 'waiting_for_input' | 'responded';

export interface UIToolCallEntry {
  kind: 'ui_tool_call';
  id: string;
  /** Backend tool call id (used to correlate TOOL_CALL_ARGS chunks with EXTERNAL_TOOL_CALL). */
  toolCallId?: string;
  name: string;
  /** Backend-side tool id (used to find the right entry when EXTERNAL_TOOL_CALL fires). */
  toolId?: string;
  /** Best-effort parsed args. May be partial while status === 'streaming'. */
  args: Record<string, unknown>;
  /** Raw accumulated args JSON (kept for streaming preview / debugging). */
  argsRaw?: string;
  status: UIToolStatus;
  /** Final result payload, populated when status === 'responded'. */
  result?: Record<string, unknown>;
  /** Convenience: human-readable outcome ('success' | 'cancelled' | 'failure' | 'error'). */
  outcome?: 'success' | 'cancelled' | 'failure' | 'error';
  timestamp: Date;
}

export type ConversationEntry = UserMessage | AssistantMessage | ToolCallEntry | UIToolCallEntry;

export interface BackendEvent {
  eventType: string;
  customEventName?: string;
  eventData: Record<string, unknown> | string;
}

export interface ChatRequest {
  message?: string;
  threadId?: string;
  commandResponse?: Record<string, unknown>;
  frontendTools?: ToolMetadata[];
}

export interface ToolMetadata {
  name: string;
  description: string;
  schema: Record<string, unknown>;
}

export interface PendingToolCall {
  toolName: string;
  toolId: string;
  args: Record<string, unknown>;
  resolve: (result: Record<string, unknown>) => void;
}

/**
 * Renderer for the "streaming" phase — shown while args are arriving.
 * `args` may be partial; tools should render a lightweight placeholder.
 */
export type ToolStreamingRenderer<TInput> = React.ComponentType<{
  args: Partial<TInput>;
  argsRaw?: string;
}>;

/**
 * Renderer for the "waiting_for_input" phase — shown to the user for interaction.
 */
export type ToolWaitingRenderer<TInput, TOutput> = React.ComponentType<{
  args: TInput;
  onSubmit: (result: TOutput) => void;
}>;

/**
 * Renderer for the "responded" phase — shown after the user submits or cancels.
 */
export type ToolRespondedRenderer<TInput, TOutput> = React.ComponentType<{
  args: TInput;
  result?: TOutput;
  outcome: 'success' | 'cancelled' | 'failure' | 'error';
}>;

/**
 * A frontend tool definition.
 *
 * The `render` object exposes three modes so any UI tool (questions, form filling,
 * design selector, etc.) can opt into the same lifecycle:
 *   - streaming        : preparing/preview UI while args stream in (optional)
 *   - waitingForInput  : interactive UI shown to the user (required)
 *   - responded        : final state UI showing the outcome (required)
 */
export interface ToolRenderers<TInput = Record<string, unknown>, TOutput = Record<string, unknown>> {
  streaming?: ToolStreamingRenderer<TInput>;
  waitingForInput: ToolWaitingRenderer<TInput, TOutput>;
  responded: ToolRespondedRenderer<TInput, TOutput>;
}

export interface ToolDefinition<TInput = Record<string, unknown>, TOutput = Record<string, unknown>> {
  name: string;
  description: string;
  schema: Record<string, unknown>;
  render: ToolRenderers<TInput, TOutput>;
  /** Maps (args, user output) to the backend `commandResponse` payload. */
  handle: (args: TInput, result: TOutput) => Record<string, unknown>;
}
