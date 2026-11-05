import { z } from "zod";

const pinSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "PIN must be exactly 4 digits.");

const resetTokenSchema = z
  .string()
  .trim()
  .min(16, "Reset token is invalid or missing.")
  .max(256, "Reset token is invalid.");

export const pinForgotSchema = z
  .object({
    body: z
      .object({
        email: z
          .string()
          .trim()
          .min(1, "Email is required.")
          .email("Enter a valid email address."),
      }),
  });

export const pinResetSchema = z
  .object({
    body: z
      .object({
        token: resetTokenSchema,
        newPin: pinSchema,
      }),
  });

export { pinSchema, resetTokenSchema };
