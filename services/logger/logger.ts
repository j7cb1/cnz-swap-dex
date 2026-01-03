import pino, { Logger, LoggerOptions } from 'pino'

export enum LoggerModule {
  App = 'app',
  Orders = 'orders',
  BTCPay = 'btcpay',
}

const moduleSettings: Record<LoggerModule, LoggerOptions> = {
  [LoggerModule.App]: {},
  [LoggerModule.Orders]: {},
  [LoggerModule.BTCPay]: {},
}

const defaultOptions: LoggerOptions = {
  redact: {
    paths: [
      'password',
      'accessToken',
      'refreshToken',
      'licenseKey',
      'key',
    ],
  },
}

function createLogger(options: LoggerOptions): Logger {
  return process.env['NODE_ENV'] === 'production'
    ? pino({
        ...defaultOptions,
        ...options,
      })
    : pino({
        ...defaultOptions,
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
        ...options,
      })
}

export function getLogger(args: {
  module: LoggerModule
  extraBindings?: Record<string, unknown>
}): Logger {
  const { module, extraBindings } = args
  const settings = moduleSettings[module]

  const logger = createLogger(settings)

  return logger.child({ module, ...extraBindings })
}
