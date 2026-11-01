
import { env } from "../config/env.js";

export const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Server error";

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid id";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this information already exists.";
  }

  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  if (statusCode >= 500) {
    console.error(err);

    if (env.NODE_ENV === "production") {
      message = "Internal server error";
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(err.code ? { code: err.code } : {}),
    ...(err.errors ? { errors: err.errors } : {}),
  });
};

export default errorHandler;
