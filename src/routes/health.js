
import { Router } from "express";
import { ok } from "../utils/respond.js";
import { AppError } from "../middleware/error.js";
// Optional: adapt path/naming if you have this
import { isFirebaseReady } from "../config/firebase.js";

const router = Router();

/** Liveness: cheap, no dependencies */
router.get("/healthz", (_req, res) => {
  res.set("Cache-Control", "no-store");
  return ok(res, { status: "up" });
});

/** Readiness: check critical deps (adjust to your stack) */
router.get("/readyz", async (_req, res, next) => {
  try {
    const firebaseOk = typeof isFirebaseReady === "function" ? !!isFirebaseReady() : true;
    if (!firebaseOk) throw new Error("Firebase not initialized");
    // Add more checks here (DB ping, cache, etc.)
    res.set("Cache-Control", "no-store");
    return ok(res, { ready: true, deps: { firebase: firebaseOk } });
  } catch (e) {
    next(new AppError(503, "Service Unavailable", { detail: e.message, extra: { deps: { firebase: false } } }));
  }
});

export { router };
export default router;
