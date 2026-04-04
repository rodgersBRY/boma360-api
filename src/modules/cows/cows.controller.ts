import { Request, Response, NextFunction } from 'express';
import { cowService } from './cows.service';
import { CowStatus } from './cows.types';
import { parsePagination } from '../../lib/pagination';

export const createCow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cow = await cowService.createCow(req.body);
    res.status(201).json(cow);
  } catch (err) { next(err); }
};

export const listCows = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const status = req.query['status'] as CowStatus | undefined;
    const pagination = parsePagination(req.query as Record<string, unknown>);
    const result = await cowService.getAllCows({ status }, pagination);
    res.json(result);
  } catch (err) { next(err); }
};

export const getCow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cow = await cowService.getCowById(req.params['id'] as string);
    res.json(cow);
  } catch (err) { next(err); }
};

export const updateCow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cow = await cowService.updateCow(req.params['id'] as string, req.body);
    res.json(cow);
  } catch (err) { next(err); }
};
