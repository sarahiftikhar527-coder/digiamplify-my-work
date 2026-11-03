import { env } from "./env.js";

export const allowedOrigins = env.CLIENT_URL;

export const corsOptions = {
  origin(origin, cb) {
    if (!origin) {
      return cb(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return cb(null, true);
    }

    return cb(null, false);
  },
  credentials: true,
};
