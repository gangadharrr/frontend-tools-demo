import fastify, { type FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { registerPublicRoutes } from './app-router';
import { AppError } from './errors/AppError';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    genReqId: () => randomUUID(),
    disableRequestLogging: true,
    // Graceful shutdown: only close idle connections on app.close().
    // Active connections (in-flight requests, SSE streams) are kept alive
    // until the request completes or terminationGracePeriodSeconds is reached.
    // Without this, Fastify v5 force-closes ALL connections immediately.
    forceCloseConnections: 'idle',
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  });

  // ── Global error handler ────────────────────────────────────────────────────
  app.setErrorHandler((err, _request, reply) => {
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send(err.toJSON());
    }
    app.log.error(err);
    return reply.status(500).send({ error: "Internal server error", code: "INTERNAL_ERROR" });
  });

  // ── Health check ────────────────────────────────────────────────────────────
  app.get('/health', async (_req, reply) => {
    return reply.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────────────────────────────
  // All public routes registered via app-router.ts
  // → POST /api/v1/agent/invoke
  // → POST /api/v1/agent/stream
  await registerPublicRoutes(app);

  return app;
}