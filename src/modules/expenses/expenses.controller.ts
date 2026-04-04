import { Request, Response, NextFunction } from 'express';
import { expenseService } from './expenses.service';

export const createExpense = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const expense = await expenseService.createExpense(req.params['cowId'] as string, req.body);
    res.status(201).json(expense);
  } catch (err) { next(err); }
};

export const listExpenses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const expenses = await expenseService.getExpensesByCow(req.params['cowId'] as string);
    res.json(expenses);
  } catch (err) { next(err); }
};
