export function ok(res, data, meta = {}) {
  return res.status(200).json({
    status: "ok",
    data,
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function created(res, data, meta = {}) {
  return res.status(201).json({
    status: "ok",
    data,
    meta: {
      requestId: res.locals.requestId,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function noContent(res) {
  return res.status(204).send();
}

export function problem(
  res,
  { type = "about:blank", title = "Error", status = 500, detail, instance, extra },
) {
  res.type("application/problem+json");
  return res.status(status).json({
    type,
    title,
    status,
    detail,
    instance: instance ?? res.req.originalUrl,
    ...extra,
  });
}

