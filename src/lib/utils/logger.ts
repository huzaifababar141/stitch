import winston from 'winston'

const { combine, timestamp, printf, colorize, json } = winston.format

// Custom format for development
const myFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata)
  }
  return msg
})

// Redact sensitive info
const redactFormat = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'authorization', 'card_number']
  
  const redact = (obj: any) => {
    if (!obj || typeof obj !== 'object') return
    for (const key in obj) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]'
      } else if (typeof obj[key] === 'object') {
        redact(obj[key])
      }
    }
  }

  redact(info)
  return info
})()

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    redactFormat,
    process.env.NODE_ENV === 'production' ? json() : combine(colorize(), myFormat)
  ),
  transports: [
    new winston.transports.Console()
  ]
})
