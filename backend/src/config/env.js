import "dotenv/config";
import { z } from "zod";

import { resolveAllowedOrigins } from "./clientOrigins.js";
import { parseTrustProxy } from "./trustProxy.js";

const baseSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1),
  CLIENT_URL: z.string().optional().default(""),
  FRONTEND_URL: z.string().optional().default(""),
  PORTAL_URL: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM_EMAIL: z.string().optional().default(""),
  PASSWORD_RESET_EXPIRES_MINUTES: z.coerce.number().default(30),
  TRUST_PROXY: z.string().optional().default(""),
  CONTACT_NOTIFY_EMAIL: z.string().optional().default(""),
  MARKETING_URL: z.string().optional().default(""),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_EXPIRES: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_DAYS: z.coerce.number().default(7),
});

const schema = baseSchema.transform((data) => {
  let clientOrigins;
  let trustProxy;

  try {
    clientOrigins = resolveAllowedOrigins(data.CLIENT_URL, data.NODE_ENV);
  } catch (error) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["CLIENT_URL"],
        message: error.message || "Invalid CLIENT_URL",
      },
    ]);
  }

  try {
    trustProxy = parseTrustProxy(
      data.TRUST_PROXY === "" ? undefined : data.TRUST_PROXY
    );
  } catch (error) {
    throw new z.ZodError([
      {
        code: "custom",
        path: ["TRUST_PROXY"],
        message: error.message || "Invalid TRUST_PROXY",
      },
    ]);
  }

  return {
    ...data,
    CLIENT_URL: clientOrigins,
    TRUST_PROXY: trustProxy,
  };
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid .env:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;