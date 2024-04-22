import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { LocationService } from '../location/location.service';
import { ApiClientService } from '../api-client/api-client.service';
import { ConfigService } from '@nestjs/config';
import { WeatherResponse } from './interfaces/weather-response';
import { WeatherTransformer } from './transformer/weather.transformer';

@Injectable()
export class WeatherService {
  private weatherForecastConfig: { baseUrl: string; key: string };

  constructor(
    private configService: ConfigService,
    private locationService: LocationService,
    private apiClientService: ApiClientService,
    private tranformer: WeatherTransformer,
  ) {
    this.weatherForecastConfig = this.configService.get('weatherForecast');
  }

  async getForecast(locationId: string) {
    try {
      const location = await this.locationService.getLocation(locationId);

      if (!location) {
        throw new BadRequestException({
          code: 'WM_WS_GET_FORECAST_FAILURE_LOCATION_NOT_FOUND',
        });
      }

      const getForecastUrl = `${this.weatherForecastConfig.baseUrl}/forecast.json?key=${this.weatherForecastConfig.key}&q=${location.latitude},${location.longitude}&days=1`;
      const response = await this.apiClientService.get<WeatherResponse>(
        getForecastUrl,
      );
      return await this.tranformer.tranformResponseToInterface(response);
    } catch (error) {
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

      if (isNaN(latInNumber) || isNaN(longInNumber)) {
        throw new BadRequestException({
          code: 'WM_WS_GET_LOCATION_WEATHER_HISTORY_INVALID_COORDIATES',
        });
      }

      const getHistoryUrl = `${this.weatherForecastConfig.baseUrl}/history.json?key=${this.weatherForecastConfig.key}&q=${latInNumber},${longInNumber}&dt=${startDate}&end_dt=${endDate}`;
      const response = await this.apiClientService.get<WeatherResponse>(
        getHistoryUrl,
      );
      return await this.tranformer.tranformResponseToInterface(response);
    } catch (error) {
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

  convertDate(currentDate: Date) {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
