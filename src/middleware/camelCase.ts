import { Request, Response, NextFunction } from 'express';

const toCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());

const convertKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(convertKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [toCamel(k), convertKeys(v)])
    );
  }
  return value;
};

export const camelCaseResponse = (_req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => originalJson(convertKeys(body));
  next();
};
