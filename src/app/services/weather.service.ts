import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private ApiUrl = 'http://localhost/weatherapi/api/';

  constructor(private http: HttpClient) { }

  getWeatherData(cityName: string) {
    return this.http.get<any>(`${this.ApiUrl}current-weather/${cityName}`);
  }

  get5DayForecast(cityName: string) {
    return this.http.get<any>(`${this.ApiUrl}5-day-forecast/${cityName}`);
  }

  getWeatherDataByCoords(lat: number, lon: number) {
    return this.http.get<any>(`${this.ApiUrl}current-weather-coords?lat=${lat}&lon=${lon}`);
  }

  get5DayForecastByCoords(lat: number, lon: number) {
    return this.http.get<any>(`${this.ApiUrl}5-day-forecast-coords?lat=${lat}&lon=${lon}`);
  }

  getWeatherDataByUrl(url: string) {
    return this.http.get<any>(`${this.ApiUrl}${url}`);
  }
}
