import { z } from "zod";

const schema = z.object({
  // NODE_ENV
  NODE_ENV: z.union([z.literal("production"), z.literal("development")]),

  // API
  SERVER_API_PORT: z.string().transform(Number),
  SERVER_CLIENT_URL: z.url(),
  VITE_API_URL: z.url(),

  // DATABASE
  SERVER_DATABASE_NAME: z.string(),
  SERVER_DATABASE_USER: z.string(),
  SERVER_DATABASE_PASS: z.string(),
  SERVER_DATABASE_HOST: z.string(),
  SERVER_DATABASE_PORT: z.string().transform(Number),

  // RESEND
  SERVER_RESEND_TOKEN: z.string(),
});

export const env = schema.parse(process.env);
