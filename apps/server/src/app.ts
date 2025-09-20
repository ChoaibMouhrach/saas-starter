import { Hono } from "hono/quick";
import { controller } from "./controllers";
import { cors } from "hono/cors";
import { env } from "./lib/env";
import { createContext, type AppContext } from "./context";
import { AppError, RedirectError } from "./lib/error";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";
import { serveStatic } from "hono/bun";

export const createApp = async () => {
  let app = new Hono<AppContext>();
  const { context } = await createContext();

  return app

    .use("/assets/*", serveStatic({ root: "./dist" }))

    .use(async (appCtx, next) => {
      appCtx.set("context", context);
      await next();
    })
    .use(
      cors({
        origin: [env.SERVER_CLIENT_URL],
        credentials: true,
      })
    )
    .onError((err, context) => {
      if (err instanceof RedirectError) {
        return context.redirect(err.redirectUrl, err.statusCode);
      }

      if (err instanceof AppError) {
        return context.json(
          {
            code: err.code,
            message: err.message,
            statusCode: err.statusCode,
          },
          err.statusCode
        );
      }

      console.error(err);

      return context.json(
        {
          statusCode: 500,
          code: HTTP_ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: "internal server error",
        },
        500
      );
    })
    .route("/api", controller)

    .get("/*", serveStatic({ root: "./dist", path: "index.html" }));
};

export type TApp = Awaited<ReturnType<typeof createApp>>;
