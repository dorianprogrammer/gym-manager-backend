/**
 * RFC 9457-compatible AppError
 * - Use: throw new AppError(404, "Not Found", { detail: "User not found" })
 * - Optional extras go in { extra: {...} }
 */
export class AppError extends Error {
  constructor(
    status = 500,
    title = "Internal Server Error",
    { type = "about:blank", detail, extra } = {},
  ) {
    super(detail || title);
    this.status = status; // preferred
    this.statusCode = status; // back-compat
    this.title = title;
    this.type = type;
    this.detail = detail;
    this.extra = extra;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

// Common specializations (optional but handy)
export class UnauthorizedError extends AppError {
  constructor(detail = "Unauthorized", opts) {
    super(401, "Unauthorized", { detail, ...opts });
  }
}
export class ForbiddenError extends AppError {
  constructor(detail = "Forbidden", opts) {
    super(403, "Forbidden", { detail, ...opts });
  }
}
export class NotFoundError extends AppError {
  constructor(detail = "Not Found", opts) {
    super(404, "Not Found", { detail, ...opts });
  }
}
export class ValidationError extends AppError {
  constructor(detail = "Bad Request", opts) {
    super(400, "Bad Request", { detail, ...opts });
  }
}

/** 404 for unmatched routes */
export function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Centralized error handler -> application/problem+json */
export function errorHandler(err, req, res, _next) {
  const isProd = process.env.NODE_ENV === "production";
  const requestId = res.locals?.requestId || req.id || req.headers["x-request-id"];

  // Normalize status and fields from many error shapes
  const status = err.status ?? err.statusCode ?? (err.name === "SyntaxError" ? 400 : 500);

  // Map popular validation error formats to Problem Details (optional)
  let detail = err.detail || err.message || "Unexpected error";
  let extra = err.extra;

  if (err?.isJoi) {
    // Joi
    detail = "Validation failed";
    extra = { issues: err.details?.map((d) => ({ message: d.message, path: d.path })) };
  } else if (err?.name === "ZodError") {
    // Zod
    detail = "Validation failed";
    extra = { issues: err.issues };
  } else if (err instanceof SyntaxError && "body" in err) {
    // Bad JSON in request
    detail = "Malformed JSON in request body";
  } else if (err.details && !extra) {
    // Back-compat with your previous shape
    extra = { details: err.details };
  }

  // Log once, with correlation id
  if (!isProd) {
    console.error({ requestId, err });
  } else {
    // minimal logging in prod; expand if you use pino/winston
    console.error({ requestId, message: err.message, status });
  }

  // RFC 9457 Problem Details response
  const body = {
    type: err.type || "about:blank",
    title: err.title || (status === 500 ? "Internal Server Error" : "Error"),
    status,
    detail,
    instance: req.originalUrl,
    ...(extra ? extra : {}),
  };

  res.status(status).type("application/problem+json").json(body);
}
