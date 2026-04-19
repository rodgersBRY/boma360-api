import { AsyncLocalStorage } from 'async_hooks';
import { SupabaseClient, User } from '@supabase/supabase-js';

interface RequestContext {
  supabase: SupabaseClient;
  accessToken?: string;
  authUser?: User;
  orgId?: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = (
  context: RequestContext,
  callback: () => void,
): void => {
  requestContextStorage.run(context, callback);
};

export const getRequestContext = (): RequestContext | undefined =>
  requestContextStorage.getStore();
