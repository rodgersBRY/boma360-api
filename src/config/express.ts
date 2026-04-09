import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "../middleware/errorHandler";
import { requestResponseLogger } from "../middleware/requestResponseLogger";
import { requireAuth, withSupabaseContext } from "../middleware/auth";
import { globalRateLimit } from "../middleware/rateLimit";
import { authRouter } from "../modules/auth/auth.router";
import { cowsRouter } from "../modules/cows/cows.router";
import { healthRouter } from "../modules/health/health.router";
import { breedingRouter } from "../modules/breeding/breeding.router";
import { milkRouter } from "../modules/milk/milk.router";
import { expensesRouter } from "../modules/expenses/expenses.router";
import { milkSalesRouter } from "../modules/milk_sales/milk_sales.router";
import { alertsRouter } from "../modules/alerts/alerts.router";
import { dashboardRouter } from "../modules/dashboard/dashboard.router";
import { supabase } from "./db";

export const initializeServer = (): Application => {
  const app = express();

  app
    .use(helmet())
    .use(cors())
    .use(express.json())
    .use(requestResponseLogger)
    .use(globalRateLimit)
    .use(withSupabaseContext);

  app.get("/v1/health", async (_req: Request, res: Response) => {
    try {
      const { error } = await supabase.from("cows").select("id").limit(1);
      if (error) throw error;

      res.json({ status: "ok", db: "connected" });
    } catch {
      res.status(503).json({ status: "error", db: "disconnected" });
    }
  });

  app
    .use("/v1/auth", authRouter)
    .use(requireAuth)
    .use("/v1/cows", cowsRouter)
    .use("/v1/cows", healthRouter)
    .use("/v1/cows", breedingRouter)
    .use("/v1/cows", milkRouter)
    .use("/v1/cows", expensesRouter)
    .use("/v1/milk-sales", milkSalesRouter)
    .use("/v1/alerts", alertsRouter)
    .use("/v1/dashboard", dashboardRouter);

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
};
