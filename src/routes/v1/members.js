import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../utils/validate.js";
import { z } from "zod";
import asyncHandler from "../../utils/async.js";
import { created } from "../../utils/respond.js";
import { countActiveMembersByGym, countCheckinsTodayByGym, countMembersByGym, listMembersByGym } from "../../services/members.js";

const router = Router();

// Validation schema
const membersSchema = z.object({
  body: z.object({
    gymId: z
      .string({
        required_error: "gymId is required",
        invalid_type_error: "gymId must be a string",
      })
      .min(1, "gymId cannot be empty"),
  }),
});

// POST /v1/members
router.post(
  "/",
  requireAuth,
  validate(membersSchema),
  asyncHandler(async (req, res) => {
    const data = req.validated.body;
    const { members } = await listMembersByGym({ gymId: data?.gymId });

    res.setHeader("Location", "/v1/members");
    return created(res, { message: "Member created", members });
  }),
);

// POST /v1/members/stats
router.post(
  "/stats",
  requireAuth,
  validate(membersSchema),
  asyncHandler(async (req, res) => {
    const { gymId } = req.validated.body;

    const [totalMembers, activeMembers, checkinsToday] = await Promise.all([
      countMembersByGym({ gymId }),
      countActiveMembersByGym({ gymId }),
      countCheckinsTodayByGym({ gymId }),
    ]);

    return res.json({
      totalMembers,
      activeMembers,
      checkinsToday,
    });
  }),
);

export { router };
export default router;
