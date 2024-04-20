import * as path from 'path';

import configuration from './config/configuration';
import { validate } from './config/validate.env';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: path.resolve(`.env`),
    validate,
    load: [configuration]
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
