import winston from 'winston';
import config from './index'; // Imports the Zod typed config directly
import os from 'os';

const { combine, timestamp, printf, colorize, json } = winston.format;

const SensitiveKeys = ['password', 'token', 'authorization', 'cookie', 'card_number', 'credit_card'];

const redactFormat = winston.format((info) => {
  const iterateAndRedact = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    Object.keys(obj).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (SensitiveKeys.some((s) => lowerKey.includes(s))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object') {
        iterateAndRedact(obj[key]);
      }
    });
    return obj;
  };

  if (info.metadata) {
    info.metadata = iterateAndRedact(JSON.parse(JSON.stringify(info.metadata)));
  }
  return info;
});

const devFormat = printf(({ level, message, timestamp, metadata, ...rest }) => {
  let msg = `[${timestamp}] ${level}: ${message}`;
  const metaObj = metadata || rest;
  
  // Safely extract out winston internal symbols from printing in local dev
  const safeMeta = Object.keys(metaObj as Record<string, any>)
    .filter((key) => typeof key === 'string' && !['level', 'message', 'timestamp', 'hostname', 'pid'].includes(key))
    .reduce((obj: Record<string, any>, key) => {
      obj[key] = (metaObj as Record<string, any>)[key];
      return obj;
    }, {});

  if (Object.keys(safeMeta).length > 0) {
    msg += `\n${JSON.stringify(safeMeta, null, 2)}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    redactFormat(),
    config.NODE_ENV === 'development' ? colorize() : json(),
    config.NODE_ENV === 'development' ? devFormat : json()
  ),
  defaultMeta: {
    service: 'stitchly-backend',
    hostname: os.hostname(),
    pid: process.pid,
  },
  transports: [
    new winston.transports.Console()
  ],
});
