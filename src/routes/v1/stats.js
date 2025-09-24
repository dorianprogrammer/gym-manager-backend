import { Router } from "express";
import {
  countActiveMembersByGym,
  countCheckinsTodayByGym,
  countMembersByGym,
  sumDailyRevenueByGym,
} from "../../services/stats.js";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../utils/validate.js";
import asyncHandler from "../../utils/async.js";
import { z } from "zod";

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

// POST /v1/stats
router.post(
  "/",
  requireAuth,
  validate(membersSchema),
  asyncHandler(async (req, res) => {
    const { gymId } = req.validated.body;

    try {
      const [totalMembers, activeMembers, checkinsToday, monthlyRevenue] = await Promise.all([
        countMembersByGym({ gymId }),
        countActiveMembersByGym({ gymId }),
        countCheckinsTodayByGym({ gymId }),
        sumDailyRevenueByGym({ gymId }),
      ]);

      return res.json({
        totalMembers,
        activeMembers,
        checkinsToday,
        monthlyRevenue,
        currency: "CRC",
      });
    } catch (error) {
      console.log("error :>> ", error);
      return res.status(500).json({ error: "Failed to fetch member statistics" });
    }
  }),
);

export { router };
export default router;
