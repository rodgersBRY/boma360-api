import { NextFunction, Request, Response } from 'express';

const toSnake = (str: string): string =>
  str.replace(/([A-Z])/g, '_$1').toLowerCase();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const normalizeKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeKeys);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        toSnake(key),
        normalizeKeys(nested),
      ]),
    );
  }

  return value;
};

export const normalizeBodyKeys = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body && isPlainObject(req.body)) {
    req.body = normalizeKeys(req.body);
  }

  next();
};
