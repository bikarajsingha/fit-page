import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { DatabaseModule } from '../database/database.module';
import { LocationRepository } from './location.repository';
import { LocationTransformer } from './transformer/location.transformer';

@Module({
  imports: [DatabaseModule],
  controllers: [LocationController],
  providers: [LocationService, LocationRepository, LocationTransformer],
  exports: [LocationService],
})
export class LocationModule {}
