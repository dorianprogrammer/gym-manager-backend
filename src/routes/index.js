
import { Router } from "express";
import { router as v1 } from "./v1/index.js";
import { router as health } from "./health.js";

const router = Router();

// Infra endpoints (unversioned). e.g. /healthz, /readyz
router.use("/", health);

// Versioned API
router.use("/v1", v1);

export { router };
export default router;
