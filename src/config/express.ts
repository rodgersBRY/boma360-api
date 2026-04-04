import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from '../middleware/errorHandler';
import { camelCaseResponse } from '../middleware/camelCase';
import { cowsRouter } from '../modules/cows/cows.router';
import { healthRouter } from '../modules/health/health.router';
import { breedingRouter } from '../modules/breeding/breeding.router';
import { milkRouter } from '../modules/milk/milk.router';
import { expensesRouter } from '../modules/expenses/expenses.router';
import { milkSalesRouter } from '../modules/milk_sales/milk_sales.router';
import { alertsRouter } from '../modules/alerts/alerts.router';
import { dashboardRouter } from '../modules/dashboard/dashboard.router';
import { pool } from './db';

export const initializeServer = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(camelCaseResponse);

  app.get('/v1/health', async (_req: Request, res: Response) => {
    try {
      const client = await pool.connect();
      client.release();
      res.json({ status: 'ok', db: 'connected' });
    } catch {
      res.status(503).json({ status: 'error', db: 'disconnected' });
    }
  });

  app.use('/v1/cows', cowsRouter);
  app.use('/v1/cows', healthRouter);
  app.use('/v1/cows', breedingRouter);
  app.use('/v1/cows', milkRouter);
  app.use('/v1/cows', expensesRouter);
  app.use('/v1/milk-sales', milkSalesRouter);
  app.use('/v1/alerts', alertsRouter);
  app.use('/v1/dashboard', dashboardRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
};
