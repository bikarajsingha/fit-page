import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { WeatherLogger } from '../logger/logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private context = { class: LoggerMiddleware.name };

  constructor(private loggerService: WeatherLogger) {}

  use(request: Request, response: Response, next: NextFunction) {
    const context = { ...this.context, function: this.use.name };
    const requestStartTime = new Date();

    this.loggerService.log(
      'Request started',
      {
        method: request.method,
        route: request.originalUrl,
        payload: {
          ...request.body,
        },
      },
      context,
    );

    response.on('close', () => {
      this.loggerService.log(
        'Request completed',
        {
          satusCode: response.statusCode,
          method: request.method,
          route: request.originalUrl,
          timeDiff: new Date().getTime() - requestStartTime.getTime(),
        },
        context,
      );
    });
    next();
  }
}
