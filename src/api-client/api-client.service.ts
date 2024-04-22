import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { WeatherLogger } from '../logger/logger.service';

@Injectable()
export class ApiClientService {
  private context = { class: ApiClientService.name };

  constructor(
    private httpService: HttpService,
    private loggerService: WeatherLogger,
  ) {}

  async get<T>(url: string) {
    const context = { ...this.context, function: this.get.name };

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<T>(url).pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
      );

      return data;
    } catch (error) {
      this.loggerService.error(
        'Get api failed',
        { error: error?.response?.data },
        context,
      );
      throw error;
    }
  }
}
