import 'dotenv/config';
import { logger } from '../config/logger';

const run = async (): Promise<void> => {
  // Keep runtime API on anon/RLS by default, but allow privileged seeding.
  if (!process.env['SUPABASE_RUNTIME_KEY'] && process.env['SUPABASE_SERVICE_ROLE_KEY']) {
    process.env['SUPABASE_RUNTIME_KEY'] = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  }

  const { connectDB } = await import('../config/db');
  const { seedTestData } = await import('../testing/seedTestData');

  await connectDB();
  await seedTestData();
};

run().catch((error) => {
  logger.error('failed to seed test data: %o', error);
  
  process.exit(1);
});
