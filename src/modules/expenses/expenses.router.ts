import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { createExpenseSchema } from './expenses.schema';
import { createExpense, listExpenses } from './expenses.controller';

export const expensesRouter = Router();

expensesRouter.get('/:cowId/expenses', listExpenses);
expensesRouter.post('/:cowId/expenses', validate(createExpenseSchema), createExpense);
