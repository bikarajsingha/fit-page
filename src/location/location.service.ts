import { ObjectId, Filter, FindOptions } from 'mongodb';

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LocationDto } from './dto/location.dto';
import { LocationEntity } from './entities/location.entity';
import { LocationRepository } from './location.repository';
import { LocationTransformer } from './transformer/location.transformer';

@Injectable()
export class LocationService {
  constructor(
    private repository: LocationRepository,
    private transformer: LocationTransformer,
  ) {}

  async createLocation(locationDto: LocationDto) {
    try {
      const nameLowercase = locationDto.name.toLowerCase();
      const rawLocation = await this.repository.get({
        $or: [
          { name: nameLowercase },
          {
            $and: [
              { latitude: locationDto.latitude },
              { longitude: locationDto.longitude },
            ],
          },
        ],
        deletedAt: { $exists: false },
      });

      if (rawLocation) {
        throw new BadRequestException({
          code: 'LM_LC_CREATE_LOCATION_FAILURE_ALREADY_EXIST',
        });
      }
      const locationEntity: LocationEntity = {
        _id: new ObjectId(),
        name: nameLowercase,
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.repository.create(locationEntity);
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'LM_LC_CREATE_LOCATION_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLocations(limit: string, skip: string) {
    try {
      const findOptions: FindOptions = {
        limit: 10,
        skip: 0,
      };

      if (limit) {
        const limitConverted = Number(limit);

        if (!isNaN(limitConverted)) {
          findOptions.limit = limitConverted;
        }
      }

      if (skip) {
        const skipConverted = Number(skip);

        if (!isNaN(skipConverted)) {
          findOptions.skip = skipConverted;
        }
      }

      const rawLocations = await this.repository.getMany(
        {
          deletedAt: {
            $exists: false,
          },
        },
        findOptions,
      );

      return await Promise.all(
        rawLocations.map(async (rawLocation) => {
          return await this.transformer.tranformEntityToInterface(rawLocation);
        }),
      );
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'LM_LC_GET_LOCATIONS_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLocation(locationId: string) {
    try {
      const rawLocation = await this.repository.get({
        _id: new ObjectId(locationId),
        deletedAt: {
          $exists: false,
        },
      });

      if (!rawLocation) {
        throw new NotFoundException({
          code: 'LM_LC_GET_LOCATION_FAILURE_NOT_FOUND',
        });
      }

      return await this.transformer.tranformEntityToInterface(rawLocation);
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'LM_LC_GET_LOCATION_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateLocation(locationId: string, locationDto: LocationDto) {
    try {
      const nameLowercase = locationDto.name.toLowerCase();
      const filter: Filter<Document> = {
        _id: new ObjectId(locationId),
        deletedAt: {
          $exists: false,
        },
      };

      const rawLocation = await this.repository.get(filter);
      if (!rawLocation) {
        throw new NotFoundException({
          code: 'LM_LC_UPDATE_LOCATION_FAILURE_NOT_FOUND',
        });
      }

      const duplicateLocation = await this.repository.get({
        deletedAt: { $exists: false },
        _id: {
          $ne: new ObjectId(locationId),
        },
        $or: [
          {
            name: nameLowercase,
          },
          {
            $and: [
              { latitude: locationDto.latitude },
              { longitude: locationDto.longitude },
            ],
          },
        ],
      });

      if (duplicateLocation) {
        throw new BadRequestException({
          code: 'LM_LC_UPDATE_LOCATION_FAILURE_ALREADY_EXIST',
        });
      }
      const locationEntity: Partial<LocationEntity> = {
        name: nameLowercase,
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
        updatedAt: new Date(),
      };

      await this.repository.updateOne(filter, { $set: locationEntity });
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'LM_LC_UPDATE_LOCATION_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteLocation(locationId: string) {
    try {
      const filter: Filter<Document> = {
        _id: new ObjectId(locationId),
        deletedAt: {
          $exists: false,
        },
      };

      const rawLocation = await this.repository.get(filter);
      if (!rawLocation) {
        throw new NotFoundException({
          code: 'LM_LC_DELETE_LOCATION_FAILURE_NOT_FOUND',
        });
      }

      await this.repository.updateOne(filter, {
        $set: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'LM_LC_DELETE_LOCATION_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
