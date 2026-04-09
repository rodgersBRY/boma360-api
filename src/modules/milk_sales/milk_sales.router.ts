import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createMilkSaleSchema } from "./milk_sales.schema";
import { createMilkSale, listMilkSales } from "./milk_sales.controller";

export const milkSalesRouter = Router();

milkSalesRouter
  .route("/")
  .get(listMilkSales)
  .post(validate(createMilkSaleSchema), createMilkSale);
