import { createClient } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";
import {
  SUPABASE_PROJECT_REF,
  SUPABASE_RUNTIME_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "../env/supabase";
import { getRequestContext } from "./requestContext";

export const createSupabaseClient = (accessToken?: string): SupabaseClient =>
  createClient(SUPABASE_URL, SUPABASE_RUNTIME_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    ...(accessToken && {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }),
  });

export const supabase = createSupabaseClient();

export const createSupabaseAdminClient = (): SupabaseClient =>
  createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY || SUPABASE_RUNTIME_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );

export const getDbClient = (): SupabaseClient =>
  getRequestContext()?.supabase ?? supabase;

export const getOrgId = (): string => {
  const orgId = getRequestContext()?.orgId;
  if (!orgId) throw new Error("Organization context not set");

  return orgId;
};

export const connectDB = async (): Promise<void> => {
  const { error } = await supabase.from("cows").select("id").limit(1);

  if (error) {
    throw error;
  }

  logger.info(`db-connected: <supabase:${SUPABASE_PROJECT_REF}>`);
};

export const getUserFromAccessToken = async (accessToken: string) => {
  const client = createSupabaseClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);
  if (error) {
    throw error;
  }

  return data.user;
};
