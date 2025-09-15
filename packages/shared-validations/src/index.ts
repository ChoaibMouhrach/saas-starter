import { z } from "zod";

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(60),
});

export type TSignInSchemaInput = z.input<typeof signInSchema>;
export type TSignInSchemaOutput = z.output<typeof signInSchema>;

export const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(60),
});

export type TSignUpSchemaInput = z.input<typeof signUpSchema>;
export type TSignUpSchemaOutput = z.output<typeof signUpSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.email(),
});

export type RequestPasswordResetInput = z.input<
  typeof requestPasswordResetSchema
>;
export type TRequestPasswordResetOutput = z.output<
  typeof requestPasswordResetSchema
>;

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(60),
});

export type TResetPasswordInput = z.input<typeof resetPasswordSchema>;
export type TResetPasswordOutput = z.output<typeof resetPasswordSchema>;

export const appQuerySchema = z.object({
  clientId: z.uuid(),
  redirectUrl: z.url(),
});
