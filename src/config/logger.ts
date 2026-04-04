import { createLogger, format, transports } from 'winston';
import { NODE_ENV } from '../env/system';

const devFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.colorize({ all: true }),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    const stackStr = stack ? `\n${stack}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}${stackStr}`;
  })
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

export const logger = createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new transports.Console()],
});
