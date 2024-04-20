import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Db, Filter, Document, FindOptions } from 'mongodb';
import { LocationEntity } from './entities/location.entity';

@Injectable()
export class LocationRepository {
  private collection = 'locations';

  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  async create(location: LocationEntity): Promise<void> {
    const insertStatus = await this.db
      .collection(this.collection)
      .insertOne(location);

    if (!insertStatus.acknowledged) {
      throw new BadRequestException({
        code: 'LM_LR_CREATE_LOCATION_FAILURE',
      });
    }
  }

  async getMany(
    filter: Filter<Document>,
    options: FindOptions,
  ): Promise<LocationEntity[]> {
    const cursor = this.db
      .collection(this.collection)
      .find<LocationEntity>(filter, options);

    const rawLocations: LocationEntity[] = [];
    while (await cursor.hasNext()) {
      const rawLocation = await cursor.next();

      if (!rawLocations) break;
      rawLocations.push(rawLocation);
    }

    return rawLocations;
  }

  async get(filter: Filter<Document>): Promise<LocationEntity> {
    return await this.db
      .collection(this.collection)
      .findOne<LocationEntity>(filter);
  }

  async updateOne(
    filter: Filter<Document>,
    updateLocation: Document,
  ): Promise<void> {
    await this.db.collection(this.collection).updateOne(filter, updateLocation);
  }
}
