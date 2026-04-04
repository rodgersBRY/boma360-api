import { Request, Response, NextFunction } from 'express';
import { breedingService } from './breeding.service';
import { parsePagination } from '../../lib/pagination';

export const createBreedingRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await breedingService.createRecord(req.params['cowId'] as string, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

export const listBreedingRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const result = await breedingService.getRecordsByCow(req.params['cowId'] as string, pagination);
    res.json(result);
  } catch (err) { next(err); }
};

export const getBreedingRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await breedingService.getRecordById(req.params['cowId'] as string, req.params['id'] as string);
    res.json(record);
  } catch (err) { next(err); }
};
