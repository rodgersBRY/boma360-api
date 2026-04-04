import { Router } from 'express';
import { getAlerts } from './alerts.controller';

export const alertsRouter = Router();

alertsRouter.get('/', getAlerts);
