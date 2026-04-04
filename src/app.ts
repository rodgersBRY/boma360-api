import 'dotenv/config';
import { connectDB } from './config/db';
import { initializeServer } from './config/express';
import { logger } from './config/logger';
import { PORT } from './env/system';

const start = async (): Promise<void> => {
  await connectDB();

  const app = initializeServer();

  app.listen(PORT, () => {
    logger.info(`server running on port ${PORT}`);
  });
};

start().catch((err) => {
  logger.error('failed to start server: %o', err);
  
  process.exit(1);
});
