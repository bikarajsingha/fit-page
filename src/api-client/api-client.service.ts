import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ApiClientService {
  constructor(private httpService: HttpService) {}

  async get<T>(url: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<T>(url).pipe(
          catchError((error: AxiosError) => {
            console.log(error.response.data);
            //   this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
      );

      return data;
    } catch (error) {
      throw error;
    }
  }
}
