import { NextFunction, Request, Response } from 'express';
import { createSupabaseClient, getUserFromAccessToken } from '../config/db';
import { runWithRequestContext } from '../config/requestContext';
import { UnauthorizedError } from '../config/errors';

const extractBearerToken = (authHeader?: string): string | undefined => {
  if (!authHeader) return undefined;
  const [scheme, token] = authHeader.split(' ');
  if (!scheme || !token) return undefined;
  if (scheme.toLowerCase() !== 'bearer') return undefined;
  return token;
};

export const withSupabaseContext = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const accessToken = extractBearerToken(req.headers.authorization);
  req.accessToken = accessToken;
  const client = createSupabaseClient(accessToken);
  runWithRequestContext({ supabase: client, accessToken }, () => next());
};

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const accessToken =
      req.accessToken ?? extractBearerToken(req.headers.authorization);
    if (!accessToken) {
      throw new UnauthorizedError('Missing bearer token');
    }

    const user = await getUserFromAccessToken(accessToken);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired access token');
    }

    req.authUser = user;
    next();
  } catch (err) {
    next(err);
  }
};
