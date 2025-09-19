import { createMiddleware } from "hono/factory";
import type { AuthAppContext } from "../context";
import { getCookie } from "hono/cookie";
import { AUTH_SESSION_COOKIE_NAME } from "../lib/constants";
import { AppError, UnauthorizedError } from "../lib/error";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";

export const createAuthMiddleware = (rules?: { emailConfirmed?: boolean }) => {
  return createMiddleware<AuthAppContext>(async (context, next) => {
    const { services } = context.get("context");
    const { database } = context.get("context").tools;

    return database.transaction(async (tx) => {
      const session = getCookie(context, AUTH_SESSION_COOKIE_NAME);

      if (!session) {
        throw new UnauthorizedError();
      }

      const { user, ...auth } = await services.auth.getAuthUser(
        { session },
        tx
      );

      if (rules?.emailConfirmed && !user.data.confirmedAt) {
        throw new AppError({
          code: HTTP_ERROR_CODES.REQUIRED_EMAIL_CONFIRMATION,
          message: "email address confirmation is required",
          statusCode: 409,
        });
      }

      context.set("auth", {
        user,
        tx,
        ...auth,
      });

      await next();
    });
  });
};

export const authMiddleware = createAuthMiddleware({
  emailConfirmed: true,
});
