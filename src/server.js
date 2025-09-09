import app from "./app.js";

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`${signal} received; shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 8000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
