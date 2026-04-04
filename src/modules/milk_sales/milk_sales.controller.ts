import { Request, Response, NextFunction } from 'express';
import { milkSalesService } from './milk_sales.service';

export const createMilkSale = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sale = await milkSalesService.createSale(req.body);
    res.status(201).json(sale);
  } catch (err) { next(err); }
};

export const listMilkSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const month = req.query['month'] as string | undefined;
    const sales = await milkSalesService.getSales(month);
    res.json(sales);
  } catch (err) { next(err); }
};
