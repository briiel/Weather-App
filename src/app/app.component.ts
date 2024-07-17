import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { WeatherService } from './services/weather.service';
import { FormsModule } from '@angular/forms';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: {
    description: string;
  }[];
}

interface ForecastData {
  dt_txt: string;
  main: {
    temp_min: number;
    temp_max: number;
  };
  weather: {
    description: string;
  }[];
  wind: {
    speed: number;
  };
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'WeatherApp';
  cityName: string = 'Manila';
  weatherData?: WeatherData;
  forecastData: ForecastData[] = [];

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.getWeatherData(this.cityName);
    this.get5DayForecast(this.cityName);
  }

  onSubmit() {
    const currentCityName = this.cityName.trim();
    if (currentCityName) {
      this.getWeatherData(currentCityName);
      this.get5DayForecast(currentCityName);
      this.cityName = ''; // clear the input field
    }
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          this.getWeatherDataByCoords(lat, lon);
          this.get5DayForecastByCoords(lat, lon);
        },
        (error) => {
          console.error('Error getting location: ', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  private getWeatherData(cityName: string) {
    this.weatherService.getWeatherData(cityName).subscribe({
      next: (response) => {
        this.weatherData = this.convertKelvinToCelsius(response);
        console.log(this.weatherData);
      }
    });
  }

  private getWeatherDataByCoords(lat: number, lon: number) {
    this.weatherService.getWeatherDataByCoords(lat, lon).subscribe({
      next: (response) => {
        this.weatherData = this.convertKelvinToCelsius(response);
        console.log(this.weatherData);
      }
    });
  }

  private get5DayForecast(cityName: string) {
    this.weatherService.get5DayForecast(cityName).subscribe({
      next: (response) => {
        this.processForecastData(response);
      }
    });
  }

  private get5DayForecastByCoords(lat: number, lon: number) {
    this.weatherService.get5DayForecastByCoords(lat, lon).subscribe({
      next: (response) => {
        this.processForecastData(response);
      }
    });
  }

  private processForecastData(response: any) {
    const forecastData: any[] = [];
    const uniqueDates = new Set();

    response.list.forEach((item: any) => {
      const forecastDate = new Date(item.dt_txt).toDateString();
      if (!uniqueDates.has(forecastDate)) {
        uniqueDates.add(forecastDate);
        forecastData.push({
          dt_txt: forecastDate,
          main: {
            temp_min: item.main.temp,
            temp_max: item.main.temp,
          },
          weather: item.weather,
          wind: item.wind,
        });
      } else {
        const existingItem = forecastData.find((x) => x.dt_txt === forecastDate);
        existingItem.main.temp_min = Math.min(existingItem.main.temp_min, item.main.temp);
        existingItem.main.temp_max = Math.max(existingItem.main.temp_max, item.main.temp);
      }
    });

    forecastData.forEach((item) => {
      item.main.temp_min -= 273.15;
      item.main.temp_max -= 273.15;
    });

    this.forecastData = forecastData.slice(0, 5);
    console.log(this.forecastData);
  }

  trackByDate(index: number, item: ForecastData): string {
    return item.dt_txt;
  }

  private convertKelvinToCelsius(data: WeatherData): WeatherData {
    return {
      ...data,
      main: {
        ...data.main,
        temp: data.main.temp - 273.15,
        temp_min: data.main.temp_min - 273.15,
        temp_max: data.main.temp_max - 273.15,
      }
    };
  }
}
