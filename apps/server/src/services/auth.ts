import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";
import { BaseService } from "../lib/service";
import { UserInstance, UserRepo } from "../repos/user";
import { HTTP_ERROR_CODES } from "@saas-starter/shared-constants";
import { AppError, ClientRedirectError, UnauthorizedError } from "../lib/error";
import {
  AUTH_EMAIL_CONFIRMATION_DURATION_IN_MS,
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_EXPIRATION_DURATION_IN_MS,
  TOKEN_TYPES,
  type EMAIL_CHANGE_CONFIRMATION_TOKEN_PAYLOAD,
} from "../lib/constants";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";

export class AuthService extends BaseService {
  private async createSession(user: UserInstance) {
    const session = await user.sessions.createFirst({
      expiresAt: new Date(Date.now() + AUTH_SESSION_EXPIRATION_DURATION_IN_MS),
    });

    return session;
  }

  private setSessionCookie(session: string, context: Context) {
    setCookie(context, AUTH_SESSION_COOKIE_NAME, session, {
      httpOnly: true,
      secure: env.NODE_ENV === "production", // HTTPS only in production
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax", // Stricter in prod
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
  }

  public signIn(
    payload: { email: string; password: string },
    context: Context
  ) {
    return this.database.transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          field: {
            email: {
              eq: payload.email,
            },
          },
        },
      });

      if (!user) {
        throw new AppError({
          statusCode: 409,
          code: HTTP_ERROR_CODES.INCORRECT_EMAIL_ADDRESS_OR_PASSWORD,
          message: "incorrect email address or password",
        });
      }

      const password = await user.passwords.findFirst({});

      if (!password) {
        throw new Error("Every user should have a password");
      }

      const isPasswordCorrect = await bcrypt.compare(
        payload.password,
        password.data.password
      );

      if (!isPasswordCorrect) {
        throw new AppError({
          statusCode: 409,
          code: HTTP_ERROR_CODES.INCORRECT_EMAIL_ADDRESS_OR_PASSWORD,
          message: "incorrect email address or password",
        });
      }

      const session = await this.createSession(user);

      this.setSessionCookie(session.data.session, context);
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
          code: HTTP_ERROR_CODES.EMAIL_ADDRESS_IN_USE,
          message: "a user with this email address already exists",
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

      await user.tokens.remove({
        where: {
          field: {
            type: {
              eq: TOKEN_TYPES.EMAIL_CONFIRMATION,
            },
          },
        },
      });

      await this.sendEmailConfirmation(user);
    });
  }

  public confirmEmail(payload: { token: string }, context: Context) {
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

      if (!token || token.data.type !== "email-confirmation") {
        throw new ClientRedirectError({
          code: HTTP_ERROR_CODES.INVALID_CONFIRMATION_URL,
        });
      }

      if (new Date() > token.data.expiresAt) {
        throw new ClientRedirectError({
          code: HTTP_ERROR_CODES.CONFIRMATION_URL_EXPIRED,
        });
      }

      const user = await token.user.findFirstOrThrow();
      user.data.confirmedAt = new Date();
      await Promise.all([user.save(), token.remove()]);

      const session = await this.createSession(user);
      this.setSessionCookie(session.data.session, context);
    });
  }

  public requestPasswordReset(payload: { email: string }) {
    return this.database.transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: {
          field: {
            email: {
              eq: payload.email,
            },
          },
        },
      });

      if (!user) {
        return;
      }

      await user.tokens.remove({
        where: {
          field: {
            type: {
              eq: TOKEN_TYPES.REQUEST_PASSWORD_RESET,
            },
          },
        },
      });

      const token = await user.tokens.createFirst({
        type: "request-password-reset",
        token: crypto.randomUUID(),
        expiresAt: new Date(
          Date.now() + AUTH_SESSION_EXPIRATION_DURATION_IN_MS
        ),
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
          statusCode: 409,
          message: "Invalid token",
          code: HTTP_ERROR_CODES.INVALID_TOKEN,
        });
      }

      if (new Date() > token.data.expiresAt) {
        throw new AppError({
          statusCode: 409,
          message: "url expired",
          code: HTTP_ERROR_CODES.URL_EXPIRED,
        });
      }

      const user = await token.user.findFirstOrThrow();

      await user.passwords.remove();

      const hashedPassword = await this.hashPassword(payload.password);
      await user.passwords.createFirst({ password: hashedPassword });
    });
  }

  public getAuthUser(payload: { session: string }, tx = this.database) {
    return tx.transaction(async (tx) => {
      const session = await tx.session.findFirst({
        where: {
          field: {
            session: {
              eq: payload.session,
            },
          },
        },
      });

      if (!session || new Date() > session.data.expiresAt) {
        throw new UnauthorizedError();
      }

      const user = await session.user.findFirstOrThrow();

      return {
        user,
        session,
      };
    });
  }

  public requestEmailChange(
    payload: { user: UserInstance; email: string },
    tx = this.database
  ) {
    return tx.transaction(async (tx) => {
      const user = await tx.user.findFirst({
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
          statusCode: 409,
          code: HTTP_ERROR_CODES.EMAIL_ADDRESS_IN_USE,
          message: "a user with this email address already exists",
        });
      }

      const tokensRepo = payload.user.tokens;
      tokensRepo.dbClient = tx.dbClient;

      const tokenType = TOKEN_TYPES.CHANGE_EMAIL;

      const tokenPayload: EMAIL_CHANGE_CONFIRMATION_TOKEN_PAYLOAD = {
        email: payload.email,
        type: tokenType,
      };

      const token = jwt.sign(tokenPayload, env.SERVER_JWT_SECRET);

      await tokensRepo.remove({
        where: {
          field: {
            type: {
              eq: "change-email",
            },
          },
        },
      });

      await tokensRepo.createFirst({
        type: tokenType,
        token,
        expiresAt: new Date(
          Date.now() + AUTH_SESSION_EXPIRATION_DURATION_IN_MS
        ),
      });

      const url = new URL("/api/auth/confirm-email-change", env.VITE_API_URL);
      url.searchParams.set("token", token);

      await this.tools.mailer.sendMail({
        from: "auth",
        to: [payload.email],
        subject: "Change email address request confirmation",
        html: `<a href="${url.toString()}" >Confirm changing email address</a>`,
      });
    });
  }

  public changeEmail(payload: { token: string }, tx = this.database) {
    return tx.transaction(async (tx) => {
      const token = await tx.token.findFirst({
        where: {
          field: {
            token: {
              eq: payload.token,
            },
          },
        },
      });

      if (token?.data.type !== TOKEN_TYPES.CHANGE_EMAIL) {
        throw new ClientRedirectError({
          code: HTTP_ERROR_CODES.INVALID_EMAIL_CHANGE_URL,
        });
      }

      if (new Date() > token.data.expiresAt) {
        throw new ClientRedirectError({
          code: HTTP_ERROR_CODES.EMAIL_CHANGE_URL_EXPIRED,
        });
      }

      let tokenData;

      try {
        tokenData = jwt.verify(
          token.data.token,
          env.SERVER_JWT_SECRET
        ) as EMAIL_CHANGE_CONFIRMATION_TOKEN_PAYLOAD;
      } catch {
        throw new ClientRedirectError({
          code: HTTP_ERROR_CODES.INVALID_EMAIL_CHANGE_URL,
        });
      }

      if (tokenData.type !== TOKEN_TYPES.CHANGE_EMAIL) {
        throw new ClientRedirectError({
          code: HTTP_ERROR_CODES.INVALID_EMAIL_CHANGE_URL,
        });
      }

      const potentielUser = await tx.user.findFirst({
        where: {
          field: {
            email: {
              eq: tokenData.email,
            },
          },
        },
      });

      const user = await token.user.findFirstOrThrow();

      if (potentielUser && potentielUser.data.id !== user.data.id) {
        throw new ClientRedirectError({
          code: HTTP_ERROR_CODES.EMAIL_CHANGE_ALREADY_IN_USE,
        });
      }

      if (!potentielUser) {
        user.data.email = tokenData.email;
        await user.save();
      }

      await token.remove();
    });
  }

  public changePassword(
    payload: {
      user: UserInstance;
      password: string;
      newPassword: string;
    },
    tx = this.database
  ) {
    return tx.transaction(async (tx) => {
      const passwordsRepo = payload.user.passwords;
      passwordsRepo.dbClient = tx.dbClient;

      const password = await passwordsRepo.findFirstOrThrow();

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

      password.data.password = await this.hashPassword(payload.newPassword);
      await password.save();
    });
  }

  public async resendConfirmationEmail(
    payload: { user: UserInstance },
    tx = this.database
  ) {
    return tx.transaction(async (tx) => {
      const user = new UserInstance({
        data: payload.user.data,
        repo: new UserRepo({ dbClient: tx.dbClient }),
      });

      if (user.data.confirmedAt) {
        return;
      }

      const tokenType = TOKEN_TYPES.EMAIL_CONFIRMATION;

      await user.tokens.remove({
        where: {
          field: {
            type: {
              eq: tokenType,
            },
          },
        },
      });

      await this.sendEmailConfirmation(user);
    });
  }

  private async sendEmailConfirmation(user: UserInstance) {
    const { url } = await this.createEmailConfirmationURL(user);

    await this.tools.mailer.sendMail({
      from: "auth",
      to: [user.data.email],
      subject: "Email confirmation",
      html: `<a href="${url.toString()}" >Confirm email</a>`,
    });
  }

  private async createEmailConfirmationURL(user: UserInstance) {
    const token = await user.tokens.createFirst({
      type: TOKEN_TYPES.EMAIL_CONFIRMATION,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + AUTH_EMAIL_CONFIRMATION_DURATION_IN_MS),
    });

    const url = new URL("/api/auth/confirm-email-address", env.VITE_API_URL);
    url.searchParams.set("token", token.data.token);

    return { url };
  }
}
