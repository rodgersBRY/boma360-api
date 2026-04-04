import { Router } from 'express';
import { getDashboard } from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/', getDashboard);
