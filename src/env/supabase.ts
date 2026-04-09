const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  
  return value;
};

const truthy = new Set(['1', 'true', 'yes']);

export const DATABASE_URL =
  process.env['SUPABASE_DB_URL'] ??
  process.env['DATABASE_URL'] ??
  required('DATABASE_URL');

export const DIRECT_URL = process.env['DIRECT_URL'] ?? DATABASE_URL;

export const SUPABASE_PROJECT_REF =
  process.env['SUPABASE_PROJECT_REF'] ?? 'local-dev';

const useSslDefault =
  !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1');

export const DB_SSL = truthy.has(
  (process.env['DB_SSL'] ?? String(useSslDefault)).toLowerCase(),
);

export const DB_SSL_REJECT_UNAUTHORIZED = truthy.has(
  (process.env['DB_SSL_REJECT_UNAUTHORIZED'] ?? 'false').toLowerCase(),
);
