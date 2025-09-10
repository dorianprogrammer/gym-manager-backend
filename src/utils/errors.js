class HttpError extends Error {
  constructor(status, title, { type = "about:blank", detail, cause, extra } = {}) {
    super(detail || title);
    this.status = status;
    this.title = title;
    this.type = type;
    this.detail = detail;
    this.extra = extra;
    if (cause) this.cause = cause;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
class UnauthorizedError extends HttpError {
  constructor(detail = "Unauthorized", opts) {
    super(401, "Unauthorized", { detail, ...opts });
  }
}
class ForbiddenError extends HttpError {
  constructor(detail = "Forbidden", opts) {
    super(403, "Forbidden", { detail, ...opts });
  }
}
class NotFoundError extends HttpError {
  constructor(detail = "Not Found", opts) {
    super(404, "Not Found", { detail, ...opts });
  }
}
class ValidationError extends HttpError {
  constructor(detail = "Bad Request", opts) {
    super(400, "Bad Request", { detail, ...opts });
  }
}

module.exports = { HttpError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError };
