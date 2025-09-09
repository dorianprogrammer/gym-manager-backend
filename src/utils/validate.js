import { ZodError } from "zod";
import { AppError } from "../middleware/error.js";

export const validate =
  (schema) =>
  (req, _res, next) => {
    try {
      req.validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message
        }));
        next(new AppError(400, "Validation failed", details));
      } else {
        next(err);
      }
    }
  };
