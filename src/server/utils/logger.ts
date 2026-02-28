import winston from 'winston'

const timestampFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level}] ${message}`
})

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    timestampFormat
  ),
  transports: [new winston.transports.Console()],
})
