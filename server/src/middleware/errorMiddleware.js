// Why does this file exist? Centralized error handler; maps errors to HTTP codes, hides internals in prod.
import { env } from "../config/env.js";

export default function errorMiddleware(err, req, res, _next) {
  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(409).json({ success: false, message: "Duplicate resource" });
  }
  const status = err.statusCode || err.status || 500;
  const message = status === 500 && env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";

  if (env.NODE_ENV !== "production" && status === 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(env.NODE_ENV !== "production" && status === 500 ? { stack: err.stack } : {}),
  });
}
