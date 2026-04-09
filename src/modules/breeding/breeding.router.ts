import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createBreedingRecordSchema } from "./breeding.schema";
import {
  createBreedingRecord,
  listBreedingRecords,
  getBreedingRecord,
} from "./breeding.controller";

export const breedingRouter = Router();

breedingRouter
  .route("/:cowId/breeding-records")
  .get(listBreedingRecords)
    .post(validate(createBreedingRecordSchema), createBreedingRecord);
  
breedingRouter.get("/:cowId/breeding-records/:id", getBreedingRecord);
