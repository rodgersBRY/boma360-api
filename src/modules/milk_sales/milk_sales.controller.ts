import { Request, Response, NextFunction } from "express";
import { milkSalesService } from "./milk_sales.service";
import { parsePagination } from "../../lib/pagination";

export const createMilkSale = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sale = await milkSalesService.createSale(req.body);

    res.status(201).json(sale);
  } catch (err) {
    next(err);
  }
};

export const listMilkSales = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const month = req.query.month as string | undefined;
    const pagination = parsePagination(req.query as Record<string, unknown>);

    const result = await milkSalesService.getSales(pagination, month);
    
    res.json(result);
  } catch (err) {
    next(err);
  }
};
