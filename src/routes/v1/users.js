import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../utils/validate.js";
import { getUserProfile, setUserProfile } from "../../lib/firestore.js";

export const router = Router();

// GET /v1/users/profile
router.get("/profile", requireAuth, async (req, res) => {
  const profile = await getUserProfile(req.user.uid);
  res.json({ profile });
});

// POST /v1/users/profile
const profileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(80),
    bio: z.string().max(280).optional()
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

router.post("/profile", requireAuth, validate(profileSchema), async (req, res) => {
  const { displayName, bio } = req.validated.body;
  await setUserProfile(req.user.uid, { displayName, bio: bio || "" });
  const profile = await getUserProfile(req.user.uid);
  res.status(201).json({ profile });
});
