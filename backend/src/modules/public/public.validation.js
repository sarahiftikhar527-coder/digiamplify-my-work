import { z } from "zod";

export const contactSubmitSchema = z
  .object({
    body: z
      .object({
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(320),
        company: z.string().trim().max(200).optional(),
        projectType: z.string().trim().min(1).max(120),
        message: z.string().trim().min(1).max(3000),
        consent: z.literal(true, {
          errorMap: () => ({ message: "Consent is required." }),
        }),
        website: z.string().optional(),
      })
      .strict(),
  });

export const newsletterSubscribeSchema = z
  .object({
    body: z
      .object({
        email: z.string().trim().email().max(320),
        consent: z.literal(true, {
          errorMap: () => ({ message: "Consent is required." }),
        }),
      })
      .strict(),
  });

const unsubscribeTokenSchema = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{64}$/i, "Invalid unsubscribe token.");

export const newsletterUnsubscribeSchema = z
  .object({
    body: z
      .object({
        token: unsubscribeTokenSchema,
      })
      .strict(),
  });

export const GENERIC_CONTACT_RESPONSE =
  "Thank you. Your message has been received.";

export const GENERIC_NEWSLETTER_SUBSCRIBE_RESPONSE =
  "Thank you. If this address is eligible, you will receive updates from us.";

export const GENERIC_NEWSLETTER_UNSUBSCRIBE_RESPONSE =
  "You have been unsubscribed from marketing emails.";
