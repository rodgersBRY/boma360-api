import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const month = req.query['month'] as string | undefined;
    const summary = await dashboardService.getSummary(month);
    res.json(summary);
  } catch (err) { next(err); }
};
