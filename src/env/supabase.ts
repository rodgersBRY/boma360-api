const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);

  return value;
};

export const SUPABASE_URL = required('SUPABASE_URL');
export const SUPABASE_URI =
  process.env['SUPABASE_URI'] ??
  process.env['DATABASE_URL'] ??
  process.env['DIRECT_URL'] ??
  '';
export const SUPABASE_ANON_KEY = process.env['SUPABASE_ANON_KEY'] ?? '';
export const SUPABASE_RUNTIME_KEY =
  process.env['SUPABASE_RUNTIME_KEY'] ??
  process.env['SUPABASE_ANON_KEY'] ??
  required('SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env['SUPABASE_SERVICE_ROLE_KEY'] ??
  '';

export const SUPABASE_PROJECT_REF =
  process.env['SUPABASE_PROJECT_REF'] ?? 'local-dev';
