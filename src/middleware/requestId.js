import { randomUUID } from "crypto";

export default function requestId(req, res, next) {
  const id = req.headers["x-request-id"] || randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  req.id = req.id || id; // back-compat
  next();
}
