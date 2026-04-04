import { createLogger, format, transports } from 'winston';
import { NODE_ENV } from '../env/system';

export const logger = createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    NODE_ENV === 'production'
      ? format.json()
      : format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
        })
  ),
  transports: [new transports.Console()],
});
