import "dotenv/config";
import { connectDB } from "./config/db";
import { initializeServer } from "./config/express";
import { logger } from "./config/logger";
import { NODE_ENV, PORT, SEED_TEST_DATA_ON_STARTUP } from "./env/system";
import { seedTestData } from "./testing/seedTestData";

const start = async (): Promise<void> => {
  await connectDB();
  
  if (SEED_TEST_DATA_ON_STARTUP) {
    if (NODE_ENV === "production") {
      logger.warn("skipping test seed data in production mode");
    } else {
      await seedTestData();
    }
  }

  const app = initializeServer();

  app.listen(PORT, () => {
    logger.info(`barn doors open — cattle manager is live on port ${PORT}`);
    logger.info("registered endpoints:");
    logger.info("  GET    /v1/health");
    logger.info("  POST   /v1/auth/sign-up");
    logger.info("  POST   /v1/auth/sign-in");
    logger.info("  POST   /v1/auth/refresh");
    logger.info("  GET    /v1/auth/me");
    logger.info("  GET    /v1/cows");
    logger.info("  POST   /v1/cows");
    logger.info("  GET    /v1/cows/:id");
    logger.info("  PATCH  /v1/cows/:id");
    logger.info("  GET    /v1/cows/:cowId/health-records");
    logger.info("  POST   /v1/cows/:cowId/health-records");
    logger.info("  GET    /v1/cows/:cowId/health-records/:id");
    logger.info("  PATCH  /v1/cows/:cowId/health-records/:id");
    logger.info("  GET    /v1/cows/:cowId/breeding-records");
    logger.info("  POST   /v1/cows/:cowId/breeding-records");
    logger.info("  GET    /v1/cows/:cowId/breeding-records/:id");
    logger.info("  GET    /v1/cows/:cowId/milk-logs");
    logger.info("  POST   /v1/cows/:cowId/milk-logs");
    logger.info("  PATCH  /v1/cows/:cowId/milk-logs/:id");
    logger.info("  GET    /v1/cows/:cowId/expenses");
    logger.info("  POST   /v1/cows/:cowId/expenses");
    logger.info("  GET    /v1/milk-sales");
    logger.info("  POST   /v1/milk-sales");
    logger.info("  GET    /v1/alerts");
    logger.info("  GET    /v1/dashboard");
  });
};

start().catch((err) => {
  logger.error("failed to start server: %o", err);

  process.exit(1);
});
