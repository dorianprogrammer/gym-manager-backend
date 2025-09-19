import app from "./app.js";
import pino from "pino";
// Optional: if you expose a cleanup in your Firebase config
// import { closeFirebase } from "./config/firebase.js";

const logger = pino({ level: process.env.NODE_ENV === "production" ? "info" : "debug" });
const PORT = Number(process.env.PORT) || 8080;

const server = app.listen(PORT, () => {
  console.log('PORT :>> ', PORT);
  logger.info({ port: PORT, env: process.env.NODE_ENV }, "API listening");
});

// ---- Harden HTTP server timeouts (protect against slowloris, ALB idle edges)
server.keepAliveTimeout = 61_000; // > typical 60s load balancer idle
server.headersTimeout = 65_000; // > keepAliveTimeout
server.requestTimeout = 30_000; // per-request ceiling

// ---- Track sockets so we can drain them on shutdown
const sockets = new Set();
server.on("connection", (socket) => {
  sockets.add(socket);
  socket.on("close", () => sockets.delete(socket));
});

// Gracefully stop accepting new connections, then end keep-alives
function drainAndClose() {
  return new Promise((resolve) => {
    server.close(() => {
      logger.info("HTTP server closed");
      resolve();
    });
    // Nudge idle keep-alive sockets to close quickly
    for (const socket of sockets) {
      socket.end();
      setTimeout(() => socket.destroy(), 2_000).unref();
    }
  });
}

async function shutdown(reason, code = 0) {
  try {
    logger.warn({ reason }, "Shutdown requested");
    await drainAndClose();

    // Optional external deps cleanup
    // if (typeof closeFirebase === "function") {
    //   try { await closeFirebase(); logger.info("Firebase closed"); }
    //   catch (e) { logger.error({ err: e }, "Error closing Firebase"); }
    // }

    process.exit(code);
  } catch (err) {
    logger.fatal({ err }, "Error during shutdown");
    process.exit(1);
  }
}

// ---- Process signals & fatal error hooks
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Nodemon/pm2 reload (Unix)
process.once("SIGUSR2", async () => {
  await shutdown("SIGUSR2");
  process.kill(process.pid, "SIGUSR2");
});

// Crash safety: log, attempt graceful close, then exit non-zero
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  shutdown("uncaughtException", 1);
});
process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  shutdown("unhandledRejection", 1);
});

// Optional: listen error handler
server.on("error", (err) => {
  logger.fatal({ err }, "HTTP server error");
  process.exit(1);
});
