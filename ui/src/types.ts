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

export type ConversationEntry = UserMessage | AssistantMessage | ToolCallEntry;

export interface BackendEvent {
  eventType: string;
  eventData: Record<string, unknown> | string;
}

export interface ChatRequest {
  message: string;
  threadId?: string;
  commandResponse?: Record<string, unknown>;
}
