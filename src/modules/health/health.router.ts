import { Router } from "express";
import { validate } from "../../middleware/validate";
import {
  createHealthRecordSchema,
  updateHealthRecordSchema,
} from "./health.schema";
import {
  createHealthRecord,
  listHealthRecords,
  getHealthRecord,
  updateHealthRecord,
} from "./health.controller";

export const healthRouter = Router();

healthRouter
  .route("/:cowId/health-records")
  .get(listHealthRecords)
  .post(validate(createHealthRecordSchema), createHealthRecord);

healthRouter
  .route("/:cowId/health-records/:id")
  .get(getHealthRecord)
  .patch(validate(updateHealthRecordSchema), updateHealthRecord);
