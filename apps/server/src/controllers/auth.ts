import { Hono } from "hono";
import type { AppContext } from "../context";
import { zValidator } from "@hono/zod-validator";
import {
  appQuerySchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@saas-starter/shared-validations";
import { authMiddleware } from "../middlewares/auth";
import z from "zod";

export const authController = new Hono<AppContext>()
  .post(
    "/sign-in",
    zValidator("json", signInSchema),
    zValidator("query", appQuerySchema),
    async (context) => {
      const body = context.req.valid("json");
      const services = context.get("context").services;
      const { clientId, redirectUrl } = context.req.valid("query");

      await services.auth.signIn({
        email: body.email,
        password: body.password,
        clientId,
        redirectUrl,
      });

      return context.json({});
    }
  )

  .post(
    "/request-password-reset",
    zValidator("json", requestPasswordResetSchema),
    zValidator("query", appQuerySchema),
    async (context) => {
      const body = context.req.valid("json");
      const services = context.get("context").services;
      const { clientId, redirectUrl } = context.req.valid("query");

      await services.auth.requestPasswordReset({
        email: body.email,
        redirectUrl,
        clientId,
      });

      return context.body(null, 204);
    }
  )

  .post(
    "/reset-password",
    zValidator("json", resetPasswordSchema),
    zValidator("query", appQuerySchema.extend({ token: z.uuid() })),
    async (context) => {
      const services = context.get("context").services;
      const body = context.req.valid("json");
      const { clientId, redirectUrl, token } = context.req.valid("query");

      await services.auth.resetPassword({
        token,
        clientId,
        redirectUrl,
        password: body.password,
      });

      return context.json({});
    }
  )

  .post(
    "/sign-up",
    zValidator("json", signUpSchema),
    zValidator("query", appQuerySchema),
    async (context) => {
      const { services } = context.get("context");
      const body = context.req.valid("json");
      const { clientId, redirectUrl } = context.req.valid("query");

      await services.auth.signUp({
        clientId,
        redirectUrl,
        email: body.email,
        password: body.password,
      });

      return context.body(null, 204);
    }
  )

  .get(
    "/confirm-email-address",
    zValidator("query", appQuerySchema.extend({ token: z.uuid() })),
    async (context) => {
      const services = context.get("context").services;
      const { token, clientId, redirectUrl } = context.req.valid("query");

      await services.auth.confirmEmail({
        token,
        clientId,
        redirectUrl,
      });

      return context.json({});
    }
  )

  .use(authMiddleware)
  .get("/user", async (context) => {
    const { user } = context.get("auth");

    return context.json({
      user,
    });
  });
