import { Request, Response, NextFunction } from 'express';

const toCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const convertKeys = (value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(convertKeys);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [toCamel(k), convertKeys(v)])
    );
  }
  return value;
};

export const camelCaseRsponse = (_req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => originalJson(convertKeys(body));
  next();
};
