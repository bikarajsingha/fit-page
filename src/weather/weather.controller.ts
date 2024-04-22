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
import { WeatherLogger } from '../logger/logger.service';

@Controller()
export class WeatherController {
  private context = { class: WeatherController.name };

  constructor(
    private service: WeatherService,
    private loggerService: WeatherLogger,
  ) {}

  @Get('weather/:locationId')
  @HttpCode(HttpStatus.OK)
  async getWeatherLocation(@Param('locationId') locationId: string) {
    const context = {
      ...this.context,
      function: this.getWeatherLocation.name,
    };

    try {
      return {
        status: true,
        code: 'WM_WC_GET_LOCATION_WEATHER_SUCCESS',
        forecast: await this.service.getForecast(locationId),
      };
    } catch (error) {
      this.loggerService.error(
        'WM_WC_GET_LOCATION_WEATHER_FAILURE',
        { message: error.message, errorstack: error.stack },
        context,
      );

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
  async getWeatherLocationHistory(
    @Query('days') days: string,
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    const context = {
      ...this.context,
      function: this.getWeatherLocationHistory.name,
    };

    try {
      return {
        status: true,
        code: 'WM_WC_GET_LOCATION_WEATHER_HISTORY_SUCCESS',
        history: await this.service.getHistory(days, latitude, longitude),
      };
    } catch (error) {
      this.loggerService.error(
        'WM_WC_GET_LOCATION_WEATHER_HISTORY_FAILURE',
        { message: error.message, errorstack: error.stack },
        context,
      );

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
