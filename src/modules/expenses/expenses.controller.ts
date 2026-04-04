import { Request, Response, NextFunction } from 'express';
import { expenseService } from './expenses.service';
import { parsePagination } from '../../lib/pagination';

export const createExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const expense = await expenseService.createExpense(req.params['cowId'] as string, req.body);
    res.status(201).json(expense);
  } catch (err) { next(err); }
};

export const listExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const result = await expenseService.getExpensesByCow(req.params['cowId'] as string, pagination);
    res.json(result);
  } catch (err) { next(err); }
};
