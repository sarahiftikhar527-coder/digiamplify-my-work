
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

  // Handle Multer file upload errors.
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "The file is too large. The maximum size is 2 MB.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      statusCode = 400;
      message = "Unexpected file. Please select the file again.";
    } else {
      statusCode = 400;
      message = "File upload failed. Please try again.";
    }
  }

  // Handle invalid JSON requests.
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON";
  }

  // Handle invalid MongoDB IDs.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid id";
  }

  // Handle duplicate database records.
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this information already exists.";
  }

  // Ensure valid HTTP status codes.
  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  // Log server errors and hide internal details in production.
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
