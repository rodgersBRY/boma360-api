export const PORT = Number(process.env['PORT'] ?? 3001);
export const NODE_ENV = process.env['NODE_ENV'] ?? 'development';
export const SEED_TEST_DATA_ON_STARTUP =
  ['1', 'true', 'yes'].includes(
    (process.env['SEED_TEST_DATA_ON_STARTUP'] ?? '').toLowerCase(),
  );

const envInt = (key: string, fallback: number): number => {
  const raw = Number(process.env[key]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
};

export const RATE_LIMIT_WINDOW_MS = envInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000);
export const RATE_LIMIT_MAX_REQUESTS = envInt('RATE_LIMIT_MAX_REQUESTS', 300);
export const AUTH_RATE_LIMIT_WINDOW_MS = envInt(
  'AUTH_RATE_LIMIT_WINDOW_MS',
  15 * 60 * 1000,
);
export const AUTH_RATE_LIMIT_MAX_REQUESTS = envInt(
  'AUTH_RATE_LIMIT_MAX_REQUESTS',
  20,
);
