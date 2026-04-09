import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createMilkLogSchema, updateMilkLogSchema } from "./milk.schema";
import { createMilkLog, listMilkLogs, updateMilkLog } from "./milk.controller";

export const milkRouter = Router();

milkRouter
  .route("/:cowId/milk-logs")
  .get(listMilkLogs)
  .post(validate(createMilkLogSchema), createMilkLog);

milkRouter
  .route("/:cowId/milk-logs/:id")
  .patch(validate(updateMilkLogSchema), updateMilkLog);
