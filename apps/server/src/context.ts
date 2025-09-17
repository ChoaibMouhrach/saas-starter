import { env } from "./lib/env";
import { Database } from "./repos";
import { Service } from "./services";
import { createDrizzle } from "./lib/drizzle";
import { DevMailer, ResendMailer } from "./lib/mailer";
import type { UserInstance } from "./repos/user";
import type { SessionInstance } from "./repos/session";

export const createContext = async () => {
  const { dbClient } = createDrizzle();

  const database = new Database({
    dbClient,
  });

  const mailer =
    env.NODE_ENV === "production"
      ? new ResendMailer({
          token: env.SERVER_RESEND_TOKEN,
        })
      : new DevMailer();

  const tools = {
    mailer,
  };

  return {
    context: {
      tools,
      services: new Service({
        database,
        tools,
      }),
    },
  };
};

export type AppContext = {
  Variables: Awaited<ReturnType<typeof createContext>>;
};

export type AuthAppContext = {
  Variables: AppContext["Variables"] & {
    auth: {
      user: UserInstance;
      session: SessionInstance;
    };
  };
};
