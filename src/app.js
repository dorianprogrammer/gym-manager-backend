import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";

import { router as rootRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler, AppError } from "./middleware/error.js";

const app = express();

// --- Logger + request id ---
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "silent" });
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers["x-request-id"] || randomUUID();
      res.setHeader("X-Request-Id", id);
      return id;
    },
  }),
);
// expose req.id to responders
app.use((req, res, next) => {
  res.locals.requestId = req.id;
  next();
});

// --- Security ---
app.disable("x-powered-by");
app.set("trust proxy", 1); // respect X-Forwarded-* when behind a proxy

app.use(
  helmet({
    contentSecurityPolicy: false, // API only
    crossOriginResourcePolicy: false, // don’t block CORS responses
  }),
);

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // non-browser clients
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin)
      ) {
        return cb(null, true);
      }
      cb(new AppError(403, "CORS origin not allowed", { detail: origin }));
    },
    credentials: true,
  }),
);

// --- Hardening + body parsing ---
app.use(hpp());
app.use(compression());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// --- Rate limit: apply to API only (exclude /healthz, /readyz) ---
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/v1", apiLimiter);

// --- Routes ---
app.use("/", rootRouter); // includes /healthz and /readyz via routes/health.js and /v1 via routes/v1

// --- 404 + centralized errors ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
