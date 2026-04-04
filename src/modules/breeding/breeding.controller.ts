import { Request, Response, NextFunction } from 'express';
import { breedingService } from './breeding.service';

export const createBreedingRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await breedingService.createRecord(req.params['cowId'] as string, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
};

export const listBreedingRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const records = await breedingService.getRecordsByCow(req.params['cowId'] as string);
    res.json(records);
  } catch (err) { next(err); }
};

export const getBreedingRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await breedingService.getRecordById(req.params['cowId'] as string, req.params['id'] as string);
    res.json(record);
  } catch (err) { next(err); }
};
