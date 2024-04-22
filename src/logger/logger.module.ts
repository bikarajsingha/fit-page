import { Module } from '@nestjs/common';

import { WeatherLogger } from './logger.service';
@Module({
  providers: [WeatherLogger],
  exports: [WeatherLogger],
})
export class WeatherLoggerModule {}
