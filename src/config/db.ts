import { Pool, PoolClient } from "pg";
import { logger } from "./logger";
import {
  DATABASE_URL,
  DB_SSL,
  DB_SSL_REJECT_UNAUTHORIZED,
  SUPABASE_PROJECT_REF,
} from "../env/supabase";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  ssl: DB_SSL ? { rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED } : undefined,
});

export const connectDB = async (): Promise<void> => {
  const client = await pool.connect();

  client.release();

  logger.info(`db-connected: <supabase:${SUPABASE_PROJECT_REF}>`);
};

export const withTransaction = async <T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await fn(client);

    await client.query("COMMIT");

    return result;
  } catch (err) {
    await client.query("ROLLBACK");

    throw err;
  } finally {
    client.release();
  }
};
