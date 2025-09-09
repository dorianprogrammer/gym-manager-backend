export class AppError extends Error {
  constructor(statusCode = 500, message = "Internal Server Error", details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(_req, _res, next) {
  next(new AppError(404, "Route not found"));
}

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";
  const payload = {
    error: {
      message: err.message || "Internal Server Error",
      ...(err.details ? { details: err.details } : {}),
      ...(isProd ? {} : { stack: err.stack })
    },
    requestId: req.id || req.headers["x-request-id"]
  };
  res.status(status).json(payload);
}
