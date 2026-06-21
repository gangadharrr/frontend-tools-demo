import { z } from "zod";
import { validatePayloadWithZod, stringToInt } from "../utils/zod.util";
import { config } from "dotenv";

config();

export const envSchema = z.object({
    PORT: stringToInt().default("3000" as unknown as number),
    LOG_LEVEL: z.string().default("info"),
    // ── LLM (OpenAI-compatible) ────────────────────────────────────────────────
    OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
    // Override to use OpenRouter (https://openrouter.ai/api/v1)
    // or Ollama (http://localhost:11434/v1)
    OPENAI_BASE_URL: z.url().optional(),
    OPENAI_MODEL: z.string().default("gpt-4o-mini"),
});

export type Env = z.infer<typeof envSchema>;

export const env = validatePayloadWithZod(envSchema, process.env);