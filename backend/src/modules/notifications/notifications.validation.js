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
    unreadOnly: z
      .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
      .transform((v) => v === true || v === "true" || v === "1")
      .optional(),
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
