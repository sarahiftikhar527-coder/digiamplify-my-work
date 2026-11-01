
export default function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;

  if (statusCode < 400 || statusCode > 599) {
    statusCode = 500;
  }

  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error."
      : err.message || "Something went wrong.";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
