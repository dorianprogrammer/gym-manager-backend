import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../utils/validate.js";
import { z } from "zod";
import asyncHandler from "../../utils/async.js";
import { created } from "../../utils/respond.js";

const router = Router();

// Validation schema
const profileSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

// POST /v1/members
router.post(
  "/",
  requireAuth,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const data = req.validated.body;

    console.log('data :>> ', data);

    

    // const { displayName, bio } = req.validated.body;
    // const uid = req.user.uid;

    // await setUserProfile(uid, { displayName, bio: bio ?? "" });
    // const profile = await getUserProfile(uid);

    res.setHeader("Location", "/v1/members");
    return created(res, { message: "Member created" });
  }),
);

export { router };
export default router;
