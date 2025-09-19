import z from "zod";
import { Hono } from "hono";
import { env } from "../lib/env";
import type { AppContext } from "../context";
import { zValidator } from "@hono/zod-validator";
import {
  changeEmailSchema,
  changePasswordSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@saas-starter/shared-validations";
import { deleteCookie } from "hono/cookie";
import { AUTH_SESSION_COOKIE_NAME } from "../lib/constants";
import { authMiddleware, createAuthMiddleware } from "../middlewares/auth";

export const authController = new Hono<AppContext>()
  .post("/sign-in", zValidator("json", signInSchema), async (context) => {
    const body = context.req.valid("json");
    const services = context.get("context").services;

    await services.auth.signIn(
      {
        email: body.email,
        password: body.password,
      },
      context
    );

    return context.body(null, 204);
  })

  .post(
    "/request-password-reset",
    zValidator("json", requestPasswordResetSchema),
    async (context) => {
      const body = context.req.valid("json");
      const services = context.get("context").services;

      await services.auth.requestPasswordReset({
        email: body.email,
      });

      return context.body(null, 204);
    }
  )

  .post(
    "/reset-password",
    zValidator("json", resetPasswordSchema),
    zValidator("query", z.object({ token: z.uuid() })),
    async (context) => {
      const services = context.get("context").services;
      const body = context.req.valid("json");
      const { token } = context.req.valid("query");

      await services.auth.resetPassword({
        token,
        password: body.password,
      });

      return context.body(null, 204);
    }
  )

  .post("/sign-up", zValidator("json", signUpSchema), async (context) => {
    const { services } = context.get("context");
    const body = context.req.valid("json");

    await services.auth.signUp({
      email: body.email,
      password: body.password,
    });

    return context.body(null, 204);
  })

  .get(
    "/confirm-email-address",
    zValidator("query", z.object({ token: z.uuid() })),
    async (context) => {
      const services = context.get("context").services;
      const { token } = context.req.valid("query");

      await services.auth.confirmEmail({ token }, context);

      return context.redirect(env.SERVER_CLIENT_URL);
    }
  )

  .use(createAuthMiddleware())

  .get("/user", async (context) => {
    const { user } = context.get("auth");

    return context.json({
      user,
    });
  })

  .post("/resend-email-confirmation", async (context) => {
    const services = context.get("context");
    const { user, tx } = context.get("auth");

    await services.services.auth.resendConfirmationEmail({ user }, tx);

    return context.body(null, 204);
  })

  .use(authMiddleware)

  .post(
    "/request-email-change",
    zValidator("json", changeEmailSchema),
    async (context) => {
      const { services } = context.get("context");
      const { user, tx } = context.get("auth");
      const body = context.req.valid("json");

      await services.auth.requestEmailChange(
        {
          user,
          email: body.email,
        },
        tx
      );

      return context.body(null, 204);
    }
  )

  .get(
    "/confirm-email-change",
    zValidator("query", z.object({ token: z.string() })),
    async (context) => {
      const token = context.req.valid("query").token;
      const { tx } = context.get("auth");
      const { services } = context.get("context");

      await services.auth.changeEmail({ token }, tx);

      const url = new URL("/change-email-address", env.SERVER_CLIENT_URL);
      return context.redirect(url);
    }
  )

  .post(
    "/change-password",
    zValidator("json", changePasswordSchema),
    async (context) => {
      const { services } = context.get("context");
      const { user, tx } = context.get("auth");
      const body = context.req.valid("json");

      await services.auth.changePassword(
        {
          user,
          password: body.password,
          newPassword: body.newPassword,
        },
        tx
      );

      return context.body(null, 204);
    }
  )

  .post("/sign-out", async (context) => {
    const { session } = context.get("auth");

    await session.remove();
    deleteCookie(context, AUTH_SESSION_COOKIE_NAME);

    return context.body(null, 204);
  });
