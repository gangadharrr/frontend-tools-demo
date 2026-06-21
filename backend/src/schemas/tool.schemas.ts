import z from "zod";

export const externalToolResumeSchema = z.object({
  externalToolResponse: z.enum(['success', 'failure']),
  successMessage: z.string().optional(),
  failureMessage: z.string().optional(),
});