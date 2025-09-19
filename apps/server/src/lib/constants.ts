// 30 days
export const AUTH_SESSION_EXPIRATION_DURATION_IN_MS = 30 * 24 * 60 * 60 * 1000;
export const AUTH_EMAIL_CONFIRMATION_DURATION_IN_MS = 1 * 24 * 60 * 60 * 1000;

export const AUTH_SESSION_COOKIE_NAME = "session";

export const TOKEN_TYPES = {
  EMAIL_CONFIRMATION: "email-confirmation",
  CHANGE_EMAIL: "change-email",
  REQUEST_PASSWORD_RESET: "request-password-reset",
} as const;

export const TOKEN_TYPES_VALUES = Object.values(TOKEN_TYPES);

export type EMAIL_CHANGE_CONFIRMATION_TOKEN_PAYLOAD = {
  email: string;
  type: (typeof TOKEN_TYPES_VALUES)[number];
};
