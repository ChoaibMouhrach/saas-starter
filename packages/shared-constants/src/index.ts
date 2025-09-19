export const HTTP_ERROR_CODES = {
  // USER
  USER_NOT_FOUND: "user-not-found",
  USER_ALREADY_EXISTS: "user-already-exists",

  // PASSWORD
  PASSWORD_NOT_FOUND: "password-not-found",
  PASSWORD_INCORRECT: "password-incorrect",

  // SESSION
  SESSION_NOT_FOUND: "session-not-found",

  // TOKEN
  TOKEN_NOT_FOUND: "token-not-found",
  INVALID_TOKEN: "invalid-token",

  // UNAUTHORIZED
  UNAUTHORIZED: "unauthorized",
  EMAIL_ADDRESS_IN_USE: "email-address-in-use",
  INCORRECT_EMAIL_ADDRESS_OR_PASSWORD: "incorrect-email-address-or-password",
  REQUIRED_EMAIL_CONFIRMATION: "required-email-confirmation",

  // URL
  INVALID_URL: "invalid-url",
  URL_EXPIRED: "url-expired",

  // EMAIL_CONFIRMATION
  INVALID_CONFIRMATION_URL: "invalid-confirmation-url",
  CONFIRMATION_URL_EXPIRED: "confirmation-url-expired",

  // EMAIL CHANGE
  EMAIL_CHANGE_URL_EXPIRED: "EMAIL-CHANGE-URL-EXPIRED",
  INVALID_EMAIL_CHANGE_URL: "invalid-email-change-url",
  EMAIL_CHANGE_ALREADY_IN_USE: "email-change-already-in-use",

  // INTERNAL SERVER ERROR
  INTERNAL_SERVER_ERROR: "internal-server-error",

  // REDIRECT
  REDIRECT: "redirect",

  // SOMETHING WENT WRONG
  SOMETHING_WENT_WRONG: "something-went-wrong",
} as const;

export type HTTP_ERROR_CODES = typeof HTTP_ERROR_CODES;
export type HTTP_ERROR_CODES_KEYS = keyof HTTP_ERROR_CODES;
export type HTTP_ERROR_CODES_VALUES = HTTP_ERROR_CODES[HTTP_ERROR_CODES_KEYS];
