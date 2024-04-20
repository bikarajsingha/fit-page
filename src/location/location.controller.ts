import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LocationDto } from './dto/location.dto';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private service: LocationService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ stopAtFirstError: true }))
  async createLocation(@Body() locationDto: LocationDto) {
    try {
      await this.service.createLocation(locationDto);

      return {
        status: true,
        code: 'LM_LC_CREATE_LOCATION_SUCCESS',
      };
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

  @Get()
  @HttpCode(HttpStatus.OK)
  async getLocations(
    @Query('limit') limit: string,
    @Query('offset') skip: string,
  ) {
    try {
      return {
        status: true,
        code: 'LM_LC_GET_LOCATIONS_SUCCESS',
        locations: await this.service.getLocations(limit, skip),
      };
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

  @Get(':locationId')
  @HttpCode(HttpStatus.OK)
  async getLocation(@Param('locationId') locationId: string) {
    try {
      return {
        status: true,
        code: 'LM_LC_GET_LOCATION_SUCCESS',
        location: await this.service.getLocation(locationId),
      };
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

  @Put(':locationId')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ stopAtFirstError: true }))
  async updateLocation(
    @Param('locationId') locationId: string,
    @Body() locationDto: LocationDto,
  ) {
    try {
      await this.service.updateLocation(locationId, locationDto);

      return {
        status: true,
        code: 'LM_LC_UPDATE_LOCATION_SUCCESS',
      };
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

  @Delete(':locationId')
  @HttpCode(HttpStatus.OK)
  async deleteLocation(@Param('locationId') locationId: string) {
    try {
      await this.service.deleteLocation(locationId);

      return {
        status: true,
        code: 'LM_LC_DELETE_LOCATION_SUCCESS',
      };
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
