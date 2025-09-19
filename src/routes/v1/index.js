import { Router } from "express";
import asyncHandler from "../../utils/async.js";
import { ok } from "../../utils/respond.js";
import { requireAuth } from "../../middleware/auth.js";

import { router as users } from "./users.js";
import { router as members } from "./members.js";
// import { router as health } from "./health.js";

const router = Router();

// Sub-routers
router.use("/users", users);
router.use("/members", members);
// router.use("/health", health);

/**
 * GET /v1/me
 * Minimal identity endpoint for the current authenticated user.
 */
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.set("Cache-Control", "private, no-store");
    return ok(res, {
      uid: req.user.uid,
      email: req.user.email ?? null,
    });
  }),
);

export { router };
export default router;
