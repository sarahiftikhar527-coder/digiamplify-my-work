import { z } from "zod";
import {
  PURPOSES,
  PREFERENCE_DEFAULTS,
} from "../../constants/notifications.js";

const objectId = z.string().trim().min(1, "Invalid id");

export const idSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(100),
    unread: z.enum(["true", "false"]).optional(),
    unreadOnly: z
      .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
      .transform((v) => v === true || v === "true" || v === "1")
      .optional(),
  }),
});

export const sendSchema = z.object({
  body: z.object({
    to: z.union([
      z.literal("all"),
      z.array(objectId).min(1).max(1000),
    ]),
    purpose: z.enum(Object.keys(PURPOSES)),
    title: z.string().trim().min(1).max(80),
    details: z.string().trim().min(1).max(500),
  }),
});

export const preferenceSchema = z.object({
  params: z.object({
    key: z.enum(PREFERENCE_DEFAULTS.map((item) => item.key)),
  }),
  body: z.object({
    on: z.boolean(),
  }),
});

export const markReadSchema = z.object({
  body: z
    .object({
      ids: z
        .array(objectId)
        .min(1)
        .max(1000)
        .optional(),
    })
    .default({}),
});

export const preferencesSchema = z.object({
  body: z.object({
    emailEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional(),
    purposes: z
      .record(
        z.enum(PURPOSES),
        z.object({
          email: z.boolean(),
          push: z.boolean(),
          inApp: z.boolean(),
        })
      )
      .optional(),
  }),
});
