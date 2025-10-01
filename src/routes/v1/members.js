import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../utils/validate.js";
import asyncHandler from "../../utils/async.js";
import { created, ok } from "../../utils/respond.js";
import { listMembersByGym } from "../../services/members.js";
import { createMemberSchema, listMembersSchema } from "../../schemas/members.js";

const router = Router();

// POST /v1/members
router.post(
  "/",
  requireAuth,
  validate(listMembersSchema),
  asyncHandler(async (req, res) => {
    const data = req.validated.body;
    const { members } = await listMembersByGym({ gymId: data?.gymId });

    res.setHeader("Location", "/v1/members");
    return ok(res, members);
  }),
);

// POST /v1/addMembers
router.post(
  "/add",
  requireAuth,
  validate(createMemberSchema),
  asyncHandler(async (req, res) => {
    const data = req.validated.body;

    console.log("data :>> ", data);

    res.setHeader("Location", "/v1/members");
    return ok(res, []);
  }),
);

export { router };
export default router;
