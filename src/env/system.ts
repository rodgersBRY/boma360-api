export const PORT = Number(process.env['PORT'] ?? 3001);
export const NODE_ENV = process.env['NODE_ENV'] ?? 'development';
export const SEED_TEST_DATA_ON_STARTUP =
  ['1', 'true', 'yes'].includes(
    (process.env['SEED_TEST_DATA_ON_STARTUP'] ?? '').toLowerCase(),
  );
