import { z } from "zod";
import { idPattern, phonePattern, trimStr, zId, zISODate } from "../validation/zodUtils.js";

export const listMembersSchema = z.object({
  params: z.object({
    gymId: zId,
  }),
});

export const createMemberSchema = z.object({
  body: z.object({
    gymId: z.string({
      required_error: "gymId is required",
    }),
    name: z.string({
      required_error: "name is required",
    }),
    email: z.string({
      required_error: "email is required",
    }),
    phone: z.string({
      required_error: "phone is required",
    }),
    idNumber: z.string({
      required_error: "idNumber is required",
    }),
    joinDate: z.string({
      required_error: "joinDate is required",
    }),
    nextDueDate: z.string({
      required_error: "nextDueDate is required",
    }),
    notes: z.string().optional(),
    planId: z.string({
      required_error: "planId is required",
    }),
    status: z.string({
      required_error: "status is required",
    }),
    lastCheckInAt: z.string().optional(),
  }),
});
