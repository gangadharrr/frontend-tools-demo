import { z } from 'zod';
import logger from '../config/logger';

const validatePayloadWithZod = <TSchema extends z.ZodSchema<unknown>>(
	schema: TSchema,
	payload: unknown,
	message: string = 'Payload did not satisfy schema',
): z.infer<TSchema> => {
	try {
		return schema.parse(payload);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errors = error.issues
				.map(err => {
					return `${err.path.join('.')}: ${err.message}`;
				})
				.join('\n');

			const summarized = error.issues.map((i: z.ZodIssue) => ({
				path: Array.isArray(i.path) && i.path.length ? i.path.join('.') : '(root)',
				message: i.message,
			}));
			logger.warn(`Zod validation failed: ${message} errors:${JSON.stringify(summarized)}`);

			throw new Error(`❌ ${message}:\n${errors}`);
		}
		logger.error({ err: error }, `Unexpected error in zod validation: ${message}`);
		throw error;
	}
};

const stringToInt = (numberSchema: z.ZodNumber = z.number()) =>
	z
		.string()
		.transform(val => parseInt(val, 10))
		.pipe(numberSchema);

const coerceBoolean = z
	.string()
	.transform(val => val === 'true')
	.pipe(z.boolean());

export { stringToInt, validatePayloadWithZod, coerceBoolean };
