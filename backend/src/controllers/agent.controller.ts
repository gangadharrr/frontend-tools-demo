import { type FastifyRequest, type FastifyReply } from "fastify";
import { z } from "zod";
import { createChatModel, streamAgent } from "../agent/utils";
import logger from "../config/logger";
import { AppError } from "../errors/AppError";
import { createAgent } from "langchain";
import { externalToolCallMiddleware } from "../agent/external-call.middleware";
import { RandomNumberTool } from "../agent/tools";
import { MemorySaver } from "@langchain/langgraph";

const  memorySaver = new MemorySaver();

export const agentBodySchema = z.object({
  message: z.string().min(1, "message must not be empty"),
  threadId: z.string().optional(),
  commandResponse: z.record(z.string(), z.unknown()).optional(),
});

export type AgentBody = z.infer<typeof agentBodySchema>;

/**
 * POST /api/v1/agent/stream
 * Streams the agent response back as Server-Sent Events (SSE).
 * Each data event contains a JSON-encoded string token.
 * The final event is `data: [DONE]`.
 */
export async function streamController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const { message, threadId, commandResponse } = request.body as AgentBody;
  logger.info({ threadId, message }, "Agent stream request");

  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const tools = [new RandomNumberTool()];
    const agent = createAgent({
      model: createChatModel(),
      tools: tools,
      middleware: [externalToolCallMiddleware(tools)],
      systemPrompt:
        "You are a helpful assistant. Use the tools available to you when needed.",
      checkpointer: memorySaver,
    });

    for await (const chunk of streamAgent(agent, message, {
      threadId,
      commandResponse,
    })) {
      reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
  } catch (err) {
    logger.error({ err }, "Agent stream error");
    const message = err instanceof AppError ? err.message : "Stream failed";
    reply.raw.write(`data: ${JSON.stringify({ error: message })}\n\n`);
  } finally {
    reply.raw.end();
  }
}
