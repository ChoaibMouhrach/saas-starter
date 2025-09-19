import {
  HTTP_ERROR_CODES,
  type HTTP_ERROR_CODES_VALUES,
} from "@saas-starter/shared-constants";
import type {
  ContentfulStatusCode,
  RedirectStatusCode,
} from "hono/utils/http-status";
import { env } from "./env";

export class AppError extends Error {
  public code;
  public statusCode;

  public constructor(context: {
    message: string;
    statusCode: ContentfulStatusCode;
    code: HTTP_ERROR_CODES_VALUES;
  }) {
    super(context.message);

    this.statusCode = context.statusCode;
    this.code = context.code;
  }
}

export class NotFoundError extends AppError {
  public constructor(context: {
    code: HTTP_ERROR_CODES_VALUES;
    message: string;
  }) {
    super({
      code: context.code,
      message: context.message,
      statusCode: 404,
    });
  }
}

export class UnauthorizedError extends AppError {
  public constructor() {
    super({
      code: HTTP_ERROR_CODES.UNAUTHORIZED,
      message: "Authentication required",
      statusCode: 401,
    });
  }
}

export class RedirectError extends Error {
  public redirectUrl: URL | string;
  public statusCode;
  public code;

  public constructor(context: {
    redirectUrl: URL | string;
    code: HTTP_ERROR_CODES_VALUES;
    statusCode?: RedirectStatusCode;
  }) {
    super(`Redirect to ${context.redirectUrl.toString()}`);
    this.redirectUrl = context.redirectUrl;
    this.code = context.code;
    this.statusCode = context.statusCode;
  }
}

export class ClientRedirectError extends RedirectError {
  public constructor(context: {
    code: HTTP_ERROR_CODES_VALUES;
    message?: string;
    statusCode?: RedirectStatusCode;
  }) {
    const url = new URL("/error", env.SERVER_CLIENT_URL);
    url.searchParams.set("error", context.code);

    super({
      redirectUrl: url,
      code: context.code || HTTP_ERROR_CODES.REDIRECT,
      statusCode: context.statusCode || 302,
    });
  }
}
