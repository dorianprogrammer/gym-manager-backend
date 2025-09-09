import { Router } from "express";
import { router as users } from "./users.js";

export const router = Router();

router.use("/users", users);

// Example protected "me" endpoint at /v1/me
import { requireAuth } from "../../middleware/auth.js";
router.get("/me", requireAuth, async (req, res) => {
  res.json({ uid: req.user.uid, email: req.user.email || null });
});
