import { Module } from '@nestjs/common';

import { LocationModule } from '../location/location.module';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { ApiCleintModule } from '../api-client/api-client.module';
import { ConfigModule } from '@nestjs/config';
import { WeatherTransformer } from './transformer/weather.transformer';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule,
    LocationModule,
    ApiCleintModule,
    CacheModule.register(),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherTransformer],
})
export class WeatherModule {}
