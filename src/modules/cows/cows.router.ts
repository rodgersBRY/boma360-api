import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createCowSchema, updateCowSchema } from "./cows.schema";
import { createCow, listCows, getCow, updateCow } from "./cows.controller";

export const cowsRouter = Router();

cowsRouter.route("/").get(listCows).post(validate(createCowSchema), createCow);

cowsRouter
  .route("/:id")
  .get(getCow)
  .patch(validate(updateCowSchema), updateCow);
