import { NextFunction, Request, Response } from "express";
import { createSupabaseClient, getUserFromAccessToken } from "../config/db";
import { getRequestContext, runWithRequestContext } from "../config/requestContext";
import { UnauthorizedError } from "../config/errors";
import { organizationsService } from "../modules/organizations/organizations.service";

const extractBearerToken = (authHeader?: string): string | undefined => {
  if (!authHeader) return undefined;

  const [scheme, token] = authHeader.split(" ");
  if (!scheme || !token) return undefined;

  if (scheme.toLowerCase() !== "bearer") return undefined;

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
      throw new UnauthorizedError("Missing bearer token");
    }

    const user = await getUserFromAccessToken(accessToken);
    if (!user) {
      throw new UnauthorizedError("Invalid or expired access token");
    }

    req.authUser = user;

    const membership = await organizationsService.getMembershipByUserId(user.id);
    if (!membership) {
      throw new UnauthorizedError("No organization found for this user");
    }

    req.orgId = membership.organization_id;

    const ctx = getRequestContext();
    if (ctx) {
      ctx.orgId = membership.organization_id;
    }

    next();
  } catch (err) {
    next(err);
  }
};
