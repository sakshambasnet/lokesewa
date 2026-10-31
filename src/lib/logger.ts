// The only place allowed to use console. Later: forward warn/error to Sentry.
// Never log personal data or payment secrets (rules.md §4.8).

type LogContext = Record<string, unknown>;

export const logger = {
  debug(message: string, context?: LogContext) {
    if (__DEV__) console.debug(message, context ?? '');
  },
  info(message: string, context?: LogContext) {
    if (__DEV__) console.info(message, context ?? '');
  },
  warn(message: string, context?: LogContext) {
    console.warn(message, context ?? '');
  },
  error(message: string, error?: unknown, context?: LogContext) {
    console.error(message, error, context ?? '');
  },
};
