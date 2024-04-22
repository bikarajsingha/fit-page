import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller()
export class WeatherController {
  constructor(private service: WeatherService) {}

  @Get('weather/:locationId')
  @HttpCode(HttpStatus.OK)
  async getLocation(@Param('locationId') locationId: string) {
    try {
      return {
        status: true,
        code: 'WM_WC_GET_LOCATION_WEATHER_SUCCESS',
        forecast: await this.service.getForecast(locationId),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'WM_WC_GET_LOCATION_WEATHER_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getLocations(
    @Query('days') days: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    try {
      return {
        status: true,
        code: 'WM_WC_GET_LOCATION_WEATHER_HISTORY_SUCCESS',
        history: await this.service.getHistory(days, latitude, longitude),
      };
    } catch (error) {
      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'WM_WC_GET_LOCATION_WEATHER_HISTORY_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
