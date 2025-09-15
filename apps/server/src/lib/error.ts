import {
  HTTP_ERROR_CODES,
  type HTTP_ERROR_CODES_VALUES,
} from "@saas-starter/shared-constants";
import type { ContentfulStatusCode } from "hono/utils/http-status";

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
