import { type FastifyInstance } from "fastify";
import { createValidatorPlugin } from "../plugins/validator.plugin";
import {
    agentBodySchema,
    streamController,
} from "../controllers/agent.controller";

export async function agentRoutes(fastify: FastifyInstance) {
    const validateBody = createValidatorPlugin("body", agentBodySchema);

    // ── POST /stream ──────────────────────────────────────────────────────────
    fastify.post("/stream", {
        preHandler: [validateBody],
        handler: streamController,
    });
}
