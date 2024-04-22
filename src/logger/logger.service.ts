import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { LogContext } from './interfaces/context.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class WeatherLogger implements LoggerService {
  debug(message: string, data?: unknown, context?: LogContext) {
    console.debug(
      JSON.stringify({
        logLevel: 'Debug',
        timestamp: new Date(),
        message,
        data,
        context: context ?? {},
      }),
    );
  }

  error(message: string, data?: unknown, context?: LogContext) {
    console.error(
      JSON.stringify({
        logLevel: 'Error',
        timestamp: new Date(),
        message,
        data,
        context: context ?? {},
      }),
    );
  }

  log(message: string, data?: unknown, context?: LogContext) {
    console.log(
      JSON.stringify({
        logLevel: 'Log',
        timestamp: new Date(),
        message,
        data,
        context: context ?? {},
      }),
    );
  }

  warn(message: string, data?: unknown, context?: LogContext) {
    console.warn(
      JSON.stringify({
        logLevel: 'Warn',
        timestamp: new Date(),
        message,
        data,
        context: context ?? {},
      }),
    );
  }
}
