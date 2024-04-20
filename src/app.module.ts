import * as path from 'path';

import configuration from './config/configuration';
import { validate } from './config/validate.env';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(`.env`),
      validate,
      load: [configuration],
    }),
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
