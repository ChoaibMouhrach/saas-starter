import { env } from "./src/lib/env";
import { defineConfig } from "drizzle-kit";

const config = defineConfig({
  out: "./drizzle",
  schema: "./src/database/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    ssl: false,
    database: env.SERVER_DATABASE_NAME,
    host: env.SERVER_DATABASE_HOST,
    port: env.SERVER_DATABASE_PORT,
    user: env.SERVER_DATABASE_USER,
    password: env.SERVER_DATABASE_PASS,
  },
});

export default config;
