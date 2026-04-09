import 'dotenv/config';
import { connectDB } from '../config/db';
import { logger } from '../config/logger';
import { seedTestData } from '../testing/seedTestData';

const run = async (): Promise<void> => {
  await connectDB();
  await seedTestData();
};

run().catch((error) => {
  logger.error('failed to seed test data: %o', error);
  
  process.exit(1);
});
