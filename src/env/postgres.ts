const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const POSTGRES_HOST = required('POSTGRES_HOST');
export const POSTGRES_USER = required('POSTGRES_USER');
export const POSTGRES_PASSWORD = required('POSTGRES_PASSWORD');
export const POSTGRES_DATABASE = required('POSTGRES_DATABASE');
export const POSTGRES_PORT = Number(process.env['POSTGRES_PORT'] ?? 5432);
export const DATABASE_URL = required('DATABASE_URL');
export const POSTGRES_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}`;
