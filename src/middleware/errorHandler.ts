import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../config/errors';
import { logger } from '../config/logger';

interface PgError extends Error {
  code?: string;
  detail?: string;
  column?: string;
  status?: number;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof CustomError) {
    logger.warn(`[${err.statusCode}] ${err.message}`);
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const pgErr = err as PgError;

  if (typeof pgErr?.status === 'number' && pgErr.status >= 400 && pgErr.status < 500) {
    res.status(pgErr.status).json({ error: pgErr.message || 'Request failed' });
    return;
  }

  if (pgErr?.code === '23505') {
    res.status(409).json({ error: 'Record already exists' });
    return;
  }

  if (pgErr?.code === '23503') {
    res.status(404).json({ error: 'Referenced record not found' });
    return;
  }

  if (pgErr?.code === '23514') {
    res.status(400).json({ error: 'Value violates check constraint' });
    return;
  }

  if (pgErr?.code === '22P02') {
    res.status(400).json({ error: 'Invalid UUID format' });
    return;
  }

  if (pgErr?.code === '23502') {
    res.status(400).json({ error: `Missing required field: ${pgErr.column ?? 'unknown'}` });
    return;
  }

  logger.error('Unhandled error %o', err);
  res.status(500).json({ error: 'Internal server error' });
};
