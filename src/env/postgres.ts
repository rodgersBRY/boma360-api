export const POSTGRES_HOST = process.env['POSTGRES_HOST'] as string;
export const POSTGRES_USER = process.env['POSTGRES_USER'] as string;
export const POSTGRES_PASSWORD = process.env['POSTGRES_PASSWORD'] as string;
export const POSTGRES_DATABASE = process.env['POSTGRES_DATABASE'] as string;
export const POSTGRES_PORT = Number(process.env['POSTGRES_PORT'] ?? 5432);
export const DATABASE_URL = process.env['DATABASE_URL'] as string;
export const POSTGRES_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}`;
