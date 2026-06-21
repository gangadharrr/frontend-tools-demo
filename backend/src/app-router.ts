import { type FastifyInstance } from "fastify";
import { agentRoutes } from "./routes/agent.route";

export async function registerPublicRoutes(app: FastifyInstance) {
    // Agent routes are nested under /api/v1/agent
    // → POST /api/v1/agent/invoke
    // → POST /api/v1/agent/stream
    await app.register(agentRoutes, { prefix: "/api/v1/agent" });
}