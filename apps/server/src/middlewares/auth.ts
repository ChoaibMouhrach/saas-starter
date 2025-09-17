import { createMiddleware } from "hono/factory";
import type { AuthAppContext } from "../context";
import { getCookie } from "hono/cookie";
import { AUTH_SESSION_COOKIE_NAME } from "../lib/constants";
import { UnauthorizedError } from "../lib/error";

export const authMiddleware = createMiddleware<AuthAppContext>(
  async (context, next) => {
    const { services } = context.get("context");

    const session = getCookie(context, AUTH_SESSION_COOKIE_NAME);

    if (!session) {
      throw new UnauthorizedError();
    }

    const auth = await services.auth.getAuthUser({
      session,
    });

    context.set("auth", auth);

    await next();
  }
);
