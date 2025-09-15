import { Pool } from "pg";
import { env } from "./env";
import { drizzle } from "drizzle-orm/node-postgres";

export const createDrizzle = () => {
  const dbPool = new Pool({
    user: env.SERVER_DATABASE_USER,
    password: env.SERVER_DATABASE_PASS,
    database: env.SERVER_DATABASE_NAME,
    port: env.SERVER_DATABASE_PORT,
    host: env.SERVER_DATABASE_HOST,
  });

  const dbClient = drizzle({ client: dbPool });

  return { dbClient, dbPool };
};

export type DbClient = Omit<
  Awaited<ReturnType<typeof createDrizzle>>["dbClient"],
  "$client"
>;
