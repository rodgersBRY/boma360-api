import { Router } from "express";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { getMe, refreshSession, signIn, signUp } from "./auth.controller";
import { refreshTokenSchema, signInSchema, signUpSchema } from "./auth.schema";

export const authRouter = Router();

authRouter.post("/sign-up", validate(signUpSchema), signUp);
authRouter.post("/sign-in", validate(signInSchema), signIn);
authRouter.post("/refresh", validate(refreshTokenSchema), refreshSession);
authRouter.get("/me", requireAuth, getMe);
