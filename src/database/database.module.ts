import { Module } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';
import { ConfigService } from '@nestjs/config';


@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Db> => {
        try {
          const database = configService.get('database');
          const client = await MongoClient.connect(database.url);

          return client.db(database.name);
        } catch (e) {
          throw e;
        }
      }
    },
  ],
  exports: ['DATABASE_CONNECTION'],
})
export class DatabaseModule {}