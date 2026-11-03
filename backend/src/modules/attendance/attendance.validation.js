import { z } from "zod";

const pinSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Enter your 4-digit PIN.");

const resetTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/i, "Reset link is invalid or expired.");

export const pinForgotSchema = z
  .object({
    body: z
      .object({
        email: z
          .string()
          .trim()
          .min(1, "Email is required.")
          .email("Enter a valid email address."),
      })
      .strict(),
  })
  .strict();

export const pinResetSchema = z
  .object({
    body: z
      .object({
        token: resetTokenSchema,
        newPin: pinSchema,
      })
      .strict(),
  })
  .strict();

export { pinSchema, resetTokenSchema };
