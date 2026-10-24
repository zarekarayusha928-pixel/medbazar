import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load root .env or local environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/medbazar_db?schema=public'),
  JWT_SECRET: z.string().default('medbazar_jwt_super_secret_signing_key_2026_dev_mode'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid backend environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

// Guarantee process.env.DATABASE_URL is available to Prisma Client
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = env.DATABASE_URL;
}
