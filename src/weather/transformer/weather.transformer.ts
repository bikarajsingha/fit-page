import { Weather } from '../interfaces/weather';
import { WeatherResponse } from '../interfaces/weather-response';

export class WeatherTransformer {
  async tranformResponseToInterface(
    rawWeather: WeatherResponse,
  ): Promise<Weather> {
    if (
      !rawWeather.forecast ||
      !rawWeather.forecast.forecastday ||
      !rawWeather.forecast.forecastday.length
    )
      return;

    const forecastday = rawWeather.forecast.forecastday;
    const weather: Weather = { ...forecastday[0].day };
    const count = forecastday.length;

    if (forecastday.length > 1) {
      forecastday.forEach((forecastWeather, index) => {
        if (index === 0) return;

        const dayWeather = forecastWeather.day;

        if (weather.maxtemp_c < dayWeather.maxtemp_c) {
          weather.maxtemp_c = dayWeather.maxtemp_c;
        }

        if (weather.maxtemp_f < dayWeather.maxtemp_f) {
          weather.maxtemp_f = dayWeather.maxtemp_f;
        }

        if (weather.mintemp_c > dayWeather.mintemp_c) {
          weather.mintemp_c = dayWeather.mintemp_c;
        }

        if (weather.mintemp_f > dayWeather.mintemp_f) {
          weather.mintemp_f = dayWeather.mintemp_f;
        }

        weather.avgtemp_c += dayWeather.avgtemp_c;
        weather.avgtemp_f += dayWeather.avgtemp_f;

        if (weather.maxwind_mph < dayWeather.maxwind_mph) {
          weather.maxwind_mph = dayWeather.maxwind_mph;
        }

        if (weather.maxwind_kph < dayWeather.maxwind_kph) {
          weather.maxwind_kph = dayWeather.maxwind_kph;
        }

        weather.totalprecip_mm += dayWeather.totalprecip_mm;
        weather.totalprecip_in += dayWeather.totalprecip_in;
        weather.totalsnow_cm += dayWeather.totalsnow_cm;

        weather.avgvis_km += dayWeather.avgvis_km;
        weather.avgvis_miles += dayWeather.avgvis_miles;
        weather.avghumidity += dayWeather.avghumidity;

        weather.daily_will_it_rain += dayWeather.daily_will_it_rain;
        weather.daily_chance_of_rain += dayWeather.daily_chance_of_rain;
        weather.daily_will_it_snow += dayWeather.daily_will_it_snow;
        weather.daily_chance_of_snow += dayWeather.daily_chance_of_snow;

        weather.uv += dayWeather.uv;
      });

      // Find average
      Object.keys(weather).forEach((key) => {
        if (
          key.includes('max') ||
          key.includes('min') ||
          key.includes('total') ||
          key.includes('condition')
        )
          return;

        weather[key] = weather[key] / count;
      });
    }

    return weather;
  }
}
