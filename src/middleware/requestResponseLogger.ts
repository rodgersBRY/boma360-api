import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';

export const requestResponseLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startedAt = Date.now();
  const requestBody = req.body;
  let responseBody: unknown;

  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    logger.debug('%s %s -> %d (%dms)', req.method, req.originalUrl, res.statusCode, Date.now() - startedAt, {
      requestBody,
      responseBody,
    });
  });

  next();
};
