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
  INCORRECT_TOKEN_TYPE: "incorrect-token-type",

  // UNAUTHORIZED
  UNAUTHORIZED: "unauthorized",

  // UNAUTHORIZED
  EMAIL_ADDRESS_IN_USE: "email-address-in-use",

  // INTERNAL SERVER ERROR
  INTERNAL_SERVER_ERROR: "internal-server-error",
} as const;

export type HTTP_ERROR_CODES = typeof HTTP_ERROR_CODES;
export type HTTP_ERROR_CODES_KEYS = keyof HTTP_ERROR_CODES;
export type HTTP_ERROR_CODES_VALUES = HTTP_ERROR_CODES[HTTP_ERROR_CODES_KEYS];
