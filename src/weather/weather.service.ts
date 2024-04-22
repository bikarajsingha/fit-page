import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { LocationService } from '../location/location.service';
import { ApiClientService } from '../api-client/api-client.service';
import { ConfigService } from '@nestjs/config';
import { WeatherResponse } from './interfaces/weather-response';
import { WeatherTransformer } from './transformer/weather.transformer';
import { Cache } from 'cache-manager';
import { WeatherLogger } from '../logger/logger.service';

@Injectable()
export class WeatherService {
  private context = { class: WeatherService.name };
  private weatherForecastConfig: { baseUrl: string; key: string };
  private cacheExpireDuration: number;

  constructor(
    private configService: ConfigService,
    private locationService: LocationService,
    private apiClientService: ApiClientService,
    private tranformer: WeatherTransformer,
    private loggerService: WeatherLogger,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
  ) {
    this.weatherForecastConfig = this.configService.get('weatherForecast');
    this.cacheExpireDuration =
      this.configService.get<number>('cacheTimeDuration');
  }

  async getForecast(locationId: string) {
    const context = {
      ...this.context,
      function: this.getForecast.name,
    };

    try {
      const location = await this.locationService.getLocation(locationId);

      if (!location) {
        throw new BadRequestException({
          code: 'WM_WS_GET_FORECAST_FAILURE_LOCATION_NOT_FOUND',
        });
      }

      const getForecastUrl = `${this.weatherForecastConfig.baseUrl}/forecast.json?key=${this.weatherForecastConfig.key}&q=${location.latitude},${location.longitude}&days=10`;
      const cacheKey = `${getForecastUrl}--${this.convertDate(
        new Date(),
        true,
      )}`;

      let response = await this.cacheManager.get<WeatherResponse>(cacheKey);
      if (!response) {
        response = await this.apiClientService.get<WeatherResponse>(
          getForecastUrl,
        );

        // Save to cache
        await this.cacheManager.set(
          cacheKey,
          response,
          this.cacheExpireDuration,
        );
      }

      this.loggerService.log(
        'Request to weather api',
        { url: getForecastUrl },
        context,
      );

      return await this.tranformer.tranformResponseToInterface(response);
    } catch (error) {
      this.loggerService.error(
        'WM_WS_GET_LOCATION_WEATHER_FAILURE',
        { message: error.message, errorstack: error.stack },
        context,
      );

      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'WM_WS_GET_LOCATION_WEATHER_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getHistory(days: string, lat: string, long: string) {
    const context = {
      ...this.context,
      function: this.getHistory.name,
    };

    try {
      const daysInNumber = Number(days) - 1;
      if (isNaN(daysInNumber) || daysInNumber < 0 || daysInNumber > 29) {
        throw new BadRequestException({
          code: 'WM_WS_GET_LOCATION_WEATHER_HISTORY_FAILURE_INVALID_DAYS',
        });
      }

      const endDate = this.convertDate(new Date());
      const endDateTimestamp = new Date(endDate);
      endDateTimestamp.setDate(endDateTimestamp.getDate() - daysInNumber);
      const startDate = this.convertDate(endDateTimestamp);

      const latInNumber = Number(lat);
      const longInNumber = Number(long);

      if (
        isNaN(latInNumber) ||
        isNaN(longInNumber) ||
        latInNumber > 90 ||
        latInNumber < -90 ||
        longInNumber > 180 ||
        longInNumber < -180
      ) {
        throw new BadRequestException({
          code: 'WM_WS_GET_LOCATION_WEATHER_HISTORY_INVALID_COORDIATES',
        });
      }

      const getHistoryUrl = `${this.weatherForecastConfig.baseUrl}/history.json?key=${this.weatherForecastConfig.key}&q=${latInNumber},${longInNumber}&dt=${startDate}&end_dt=${endDate}`;
      const cacheKey = `${getHistoryUrl}--${this.convertDate(
        new Date(),
        true,
      )}`;

      let response = await this.cacheManager.get<WeatherResponse>(cacheKey);
      if (!response) {
        response = await this.apiClientService.get<WeatherResponse>(
          getHistoryUrl,
        );

        // Save to cache
        await this.cacheManager.set(
          cacheKey,
          response,
          this.cacheExpireDuration,
        );
      }

      this.loggerService.log(
        'Request to weather api',
        { url: getHistoryUrl },
        context,
      );

      return await this.tranformer.tranformResponseToInterface(response);
    } catch (error) {
      this.loggerService.error(
        'WM_WS_GET_LOCATION_WEATHER_HISTORY_FAILURE',
        { message: error.message, errorstack: error.stack },
        context,
      );

      throw new HttpException(
        {
          status: false,
          code: error?.response?.code
            ? error.response.code
            : 'WM_WS_GET_LOCATION_WEATHER_HISTORY_FAILURE',
        },
        error.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  convertDate(currentDate: Date, allowHour: boolean = false) {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    if (allowHour) {
      return `${year}-${month}-${day}:${currentDate
        .getHours()
        .toString()
        .padStart(2, '0')}`;
    }

    return `${year}-${month}-${day}`;
  }
}
