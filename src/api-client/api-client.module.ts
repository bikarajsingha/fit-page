import { Module } from '@nestjs/common';

import { ApiClientService } from './api-client.service';
import { HttpModule } from '@nestjs/axios';
import { WeatherLoggerModule } from '../logger/logger.module';

@Module({
  imports: [HttpModule, WeatherLoggerModule],
  providers: [ApiClientService],
  exports: [ApiClientService],
})
export class ApiCleintModule {}
