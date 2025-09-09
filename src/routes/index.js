import { Router } from "express";
import { router as v1 } from "./v1/index.js";
import { router as health } from "./health.js";

export const router = Router();

router.use("/", health);
router.use("/v1", v1);
