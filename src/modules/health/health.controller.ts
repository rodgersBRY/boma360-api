import { Request, Response, NextFunction } from 'express';
import { healthService } from './health.service';
import { parsePagination } from '../../lib/pagination';

export const createHealthRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await healthService.createRecord(req.params['cowId'] as string, req.body);
    res.status(201).json(record);
  } catch (err) { next(err); }
};

export const listHealthRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const result = await healthService.getRecordsByCow(req.params['cowId'] as string, pagination);
    res.json(result);
  } catch (err) { next(err); }
};

export const getHealthRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await healthService.getRecordById(req.params['cowId'] as string, req.params['id'] as string);
    res.json(record);
  } catch (err) { next(err); }
};

export const updateHealthRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await healthService.updateRecord(req.params['cowId'] as string, req.params['id'] as string, req.body);
    res.json(record);
  } catch (err) { next(err); }
};
