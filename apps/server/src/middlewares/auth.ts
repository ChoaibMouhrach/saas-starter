import { createMiddleware } from "hono/factory";
import type { AuthAppContext } from "../context";

export const authMiddleware = createMiddleware<AuthAppContext>(
  async (context, next) => {
    const { services } = context.get("context");
    const { session } = context.req.query();

    if (!session) {
      // TODO: redirect later
      throw new Error("");
    }

    const auth = await services.auth.getAuthUser({
      session,
    });

    context.set("auth", auth);

    await next();
  }
);
