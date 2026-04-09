import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";
import {
  SUPABASE_PROJECT_REF,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../env/supabase";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const connectDB = async (): Promise<void> => {
  const { error } = await supabase.from("cows").select("id").limit(1);

  if (error) {
    throw error;
  }

  logger.info(`db-connected: <supabase:${SUPABASE_PROJECT_REF}>`);
};
