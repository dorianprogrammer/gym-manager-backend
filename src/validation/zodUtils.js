import { z } from "zod";

export const trimStr = z.string().trim(); // stays ZodString
export const zId = z.string().trim().min(1, "id cannot be empty");
export const zISODate = z
  .union([z.string(), z.number(), z.date()])
  .transform((v) => new Date(v))
  .refine((d) => !Number.isNaN(d.getTime()), { message: "Invalid date" });

// patterns
export const phonePattern = /^[0-9+\-\s()]{8,20}$/;
export const idPattern = /^[0-9A-Za-z\-]{9,30}$/;
