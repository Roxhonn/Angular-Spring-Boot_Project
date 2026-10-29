import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CropPriceForecastDto {
  crop: string;
  market: string;
  currentPricePerQuintal: number;
  predictedPricePerQuintal: number;
  changePercent: number;
  signal: 'UPWARD' | 'STABLE' | 'CAUTION';
}

@Injectable({ providedIn: 'root' })
export class MandiApiService {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  constructor(private readonly http: HttpClient) {}

  getCropPriceForecasts(): Observable<CropPriceForecastDto[]> {
    return this.http.get<CropPriceForecastDto[]>(`${this.apiBaseUrl}/price-forecasts`);
  }
}
