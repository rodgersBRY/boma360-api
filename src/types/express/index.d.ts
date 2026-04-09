import type { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      authUser?: User;
    }
  }
}

export {};
