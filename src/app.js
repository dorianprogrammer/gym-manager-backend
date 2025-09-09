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

import {  checkFirebaseReady } from "./config/firebase.js";
import { errorHandler, notFoundHandler, AppError } from "./middleware/error.js";
import { router as rootRouter } from "./routes/index.js";

const app = express();

// --- Logger ---
const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existing = req.headers["x-request-id"];
      const id = existing || randomUUID();
      res.setHeader("X-Request-Id", id);
      return id;
    }
  })
);

// --- Security ---
app.disable("x-powered-by");
app.set("trust proxy", 1); // respect X-Forwarded-* (rate limit, IP logs behind proxies)

app.use(helmet({
  contentSecurityPolicy: false // API-only: typically not rendering HTML
}));

const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow non-browser clients
    if (allowedOrigins.length === 0 || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    cb(new AppError(403, "CORS origin not allowed"));
  },
  credentials: true
}));

app.use(hpp());
app.use(compression());

// Body parser with sensible limits
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

// Rate limit (global base) - tweak as needed
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// --- Health endpoints ---
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.get("/ready", async (_req, res) => {
  const ok = await checkFirebaseReady();
  if (!ok) return res.status(503).json({ status: "not_ready" });
  res.status(200).json({ status: "ready" });
});

// --- Routes ---
app.use("/", rootRouter);

// 404 + error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
