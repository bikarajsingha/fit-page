import { ObjectId, Filter } from 'mongodb';

import {
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
      const locationEntity: LocationEntity = {
        _id: new ObjectId(),
        name: locationDto.name,
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
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

  async getLocations(limit: number, skip: number) {
    try {
      const rawLocations = await this.repository.getMany(
        {
          deletedAt: {
            $exists: false,
          },
        },
        { limit, skip },
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

      return rawLocation;
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
      const locationEntity: Partial<LocationEntity> = {
        name: locationDto.name,
        latitude: locationDto.latitude,
        longitude: locationDto.longitude,
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
