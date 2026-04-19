import { Router } from "express";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { authRateLimit } from "../../middleware/rateLimit";
import { getMe, getMyOrganization, refreshSession, signIn, signUp } from "./auth.controller";
import { refreshTokenSchema, signInSchema, signUpSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/sign-up", authRateLimit, validate(signUpSchema), signUp);
authRouter.post("/sign-in", authRateLimit, validate(signInSchema), signIn);
authRouter.post("/refresh", authRateLimit, validate(refreshTokenSchema), refreshSession);
authRouter.get("/me", requireAuth, getMe);
authRouter.get("/me/organization", requireAuth, getMyOrganization);
