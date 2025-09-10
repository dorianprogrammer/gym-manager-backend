import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../utils/validate.js";
import { getUserProfile, setUserProfile } from "../../lib/firestore.js";
import { ok, created } from "../../utils/respond.js";
import { NotFoundError } from "../../middleware/error.js";
import asyncHandler from "../../utils/async.js";

const router = Router();

/**
 * Preferred: /v1/users/me
 * Also keep /profile for backward compatibility.
 */

// GET /v1/users/me
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const uid = req.user?.uid;
    const profile = await getUserProfile(uid);
    if (!profile) throw new NotFoundError(`No profile found for uid ${uid}.`);

    // Avoid caching sensitive profile data
    res.set("Cache-Control", "private, no-store");
    return ok(res, { profile });
  }),
);

// Legacy GET /v1/users/profile
router.get(
  "/profile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const uid = req.user?.uid;
    const profile = await getUserProfile(uid);
    if (!profile) throw new NotFoundError(`No profile found for uid ${uid}.`);

    res.set("Cache-Control", "private, no-store");
    return ok(res, { profile });
  }),
);

// Validation schema
const profileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(80),
    bio: z.string().max(280).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

// POST /v1/users/me
router.post(
  "/me",
  requireAuth,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const { displayName, bio } = req.validated.body;
    const uid = req.user.uid;

    await setUserProfile(uid, { displayName, bio: bio ?? "" });
    const profile = await getUserProfile(uid);

    res.setHeader("Location", "/v1/users/me");
    return created(res, { profile });
  }),
);

// Legacy POST /v1/users/profile
router.post(
  "/profile",
  requireAuth,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const { displayName, bio } = req.validated.body;
    const uid = req.user.uid;

    await setUserProfile(uid, { displayName, bio: bio ?? "" });
    const profile = await getUserProfile(uid);

    res.setHeader("Location", "/v1/users/me");
    return created(res, { profile });
  }),
);

export { router };
export default router;
