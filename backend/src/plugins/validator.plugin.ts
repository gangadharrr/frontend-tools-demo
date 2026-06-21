import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AppError } from '../errors/AppError';

export function validateSchema<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
	const result = schema.safeParse(data);
	if (!result.success) {
		// Zod v4: uses .issues (was .errors in v3)
		const errorMessage = result.error.issues
			.map((issue: z.ZodIssue) => `${issue.path.join('.')}: ${issue.message}`)
			.join(', ');
		throw new AppError(errorMessage, 400, 'VALIDATION_ERROR');
	}
	// Type assertion is safe here because safeParse guarantees the data matches the schema
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return result.data;
}

type ValidateLocation = 'params' | 'query' | 'body';

export function createValidatorPlugin<T extends z.ZodTypeAny>(
	location: ValidateLocation,
	schema: T,
) {
	return async (request: FastifyRequest, _reply: FastifyReply) => {
		switch (location) {
			case 'params':
				request.params = validateSchema(schema, request.params);
				break;
			case 'query':
				request.query = validateSchema(schema, request.query);
				break;
			case 'body':
				request.body = validateSchema(schema, request.body);
				break;
		}
	};
}
