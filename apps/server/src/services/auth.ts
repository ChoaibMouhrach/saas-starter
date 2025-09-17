import bcrypt from "bcryptjs";
import { AppError, UnauthorizedError } from "../lib/error";
import { BaseService } from "../lib/service";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";
import { env } from "../lib/env";

export class AuthService extends BaseService {
  public signIn(payload: { email: string; password: string }) {
    return this.database.transaction(async (tx) => {
      const user = await tx.user.findFirstOrThrow({
        where: {
          field: {
            email: {
              eq: payload.email,
            },
          },
        },
      });

      const password = await user.passwords.findFirstOrThrow({});

      const isPasswordCorrect = await bcrypt.compare(
        payload.password,
        password.data.password
      );

      if (!isPasswordCorrect) {
        throw new AppError({
          code: HTTP_ERROR_CODES.PASSWORD_INCORRECT,
          message: "the password is not correct",
          statusCode: 409,
        });
      }

      const session = await user.sessions.createFirst({});

      return {
        session,
      };
    });
  }

  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  public signUp(payload: { email: string; password: string }) {
    return this.database.transaction(async (tx) => {
      let user = await tx.user.findFirst({
        where: {
          field: {
            email: {
              eq: payload.email,
            },
          },
        },
      });

      if (user) {
        throw new AppError({
          code: HTTP_ERROR_CODES.USER_ALREADY_EXISTS,
          message: "user already exists",
          statusCode: 409,
        });
      }

      user = await tx.user.createFirst({
        email: payload.email,
      });

      const hashedPassword = await this.hashPassword(payload.password);

      await user.passwords.createFirst({
        password: hashedPassword,
      });

      const token = await user.tokens.createFirst({
        type: "email-confirmation",
      });

      const url = new URL("/api/auth/confirm-email-address", env.VITE_API_URL);
      url.searchParams.set("token", token.data.token);

      await this.tools.mailer.sendMail({
        from: "auth",
        to: [user.data.email],
        subject: "Email confirmation",
        html: `<a href="${url.toString()}" >Confirm email</a>`,
      });
    });
  }

  public confirmEmail(payload: { token: string }) {
    return this.database.transaction(async (tx) => {
      const token = await tx.token.findFirst({
        where: {
          field: {
            token: {
              eq: payload.token,
            },
          },
        },
      });

      if (!token) {
        // TODO: try a redirect to an error page
        throw new Error("");
      }

      if (token.data.type !== "email-confirmation") {
        // TODO: try a redirect to an error page
        throw new Error("");
      }

      // remove token
      await token.remove();

      const user = await token.user.findFirstOrThrow();

      const session = await user.sessions.createFirst({});

      return {
        session,
      };
    });
  }

  public requestPasswordReset(payload: { email: string }) {
    return this.database.transaction(async (tx) => {
      const user = await tx.user.findFirstOrThrow({
        where: {
          field: {
            email: {
              eq: payload.email,
            },
          },
        },
      });

      const token = await user.tokens.createFirst({
        type: "request-password-reset",
      });

      const url = new URL("/reset-password", env.SERVER_CLIENT_URL);
      url.searchParams.set("token", token.data.token);

      await this.tools.mailer.sendMail({
        from: "auth",
        to: [user.data.email],
        subject: "Reset password",
        html: `<a href="${url.toString()}" >Reset password</a>`,
      });
    });
  }

  public resetPassword(payload: { token: string; password: string }) {
    return this.database.transaction(async (tx) => {
      const token = await tx.token.findFirstOrThrow({
        where: {
          field: {
            token: {
              eq: payload.token,
            },
          },
        },
      });

      if (token.data.type !== "request-password-reset") {
        throw new AppError({
          code: HTTP_ERROR_CODES.INCORRECT_TOKEN_TYPE,
          statusCode: 409,
          message: "invalid token type",
        });
      }

      const user = await token.user.findFirstOrThrow();

      await user.passwords.remove();

      const hashedPassword = await this.hashPassword(payload.password);
      await user.passwords.createFirst({ password: hashedPassword });

      const session = await user.sessions.createFirst({});

      return {
        session,
      };
    });
  }

  public getAuthUser(payload: { session: string }) {
    return this.database.transaction(async (tx) => {
      const session = await tx.session.findFirst({
        where: {
          field: {
            session: {
              eq: payload.session,
            },
          },
        },
      });

      if (!session) {
        throw new UnauthorizedError();
      }

      const user = await session.user.findFirstOrThrow();

      return {
        user,
      };
    });
  }
}
