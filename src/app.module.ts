import * as path from 'path';

import configuration from './config/configuration';
import { validate } from './config/validate.env';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocationModule } from './location/location.module';
import { WeatherModule } from './weather/weather.module';
import { ApiCleintModule } from './api-client/api-client.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(`.env`),
      validate,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const rateLimit = await configService.get('rateLimit');
        return [
          {
            ttl: rateLimit.timeToLive,
            limit: rateLimit.limit,
          },
        ];
      },
    }),
    WeatherModule,
    LocationModule,
    ApiCleintModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
