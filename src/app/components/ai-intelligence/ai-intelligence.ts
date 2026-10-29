import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcurementService } from '../../services/procurement.service';
import { AIAlert } from '../../models/procurement.model';
import { CropPriceForecastDto, MandiApiService } from '../../services/mandi-api.service';

interface CropPriceForecast extends CropPriceForecastDto {
  crop: string;
  currentPricePerQuintal: number;
  predictedPricePerQuintal: number;
}

@Component({
  selector: 'app-ai-intelligence',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-wrapper">
      <div class="page-header-title">
        <div>
          <h1><i class="fa-solid fa-chart-line text-primary"></i> Crop Price & Mandi Intelligence</h1>
          <p class="page-header-subtitle">Crop-price forecasts, demand signals, queue bottlenecks and Mandi load balancing</p>
        </div>
        <span class="badge badge-purple">ML Simulation Active</span>
      </div>

      <div class="forecast-grid">
        <article class="forecast-card" *ngFor="let forecast of priceForecasts">
          <div class="forecast-topline">
            <span class="crop-name">{{ forecast.crop }}</span>
            <span class="signal" [class.signal-up]="forecast.signal === 'UPWARD'" [class.signal-stable]="forecast.signal === 'STABLE'" [class.signal-caution]="forecast.signal === 'CAUTION'">
              {{ forecast.signal }}
            </span>
          </div>
          <div class="price-row">
            <strong>₹{{ forecast.predictedPricePerQuintal | number }}/qtl</strong>
            <span [class.price-up]="forecast.changePercent > 0" [class.price-down]="forecast.changePercent < 0">
              {{ forecast.changePercent > 0 ? '+' : '' }}{{ forecast.changePercent }}%
            </span>
          </div>
          <p>Current: ₹{{ forecast.currentPricePerQuintal | number }}/qtl · {{ forecast.market }}</p>
        </article>
      </div>

      <div class="agri-card mb-6">
        <div class="agri-card-header">
          <div class="agri-card-title">
            <i class="fa-solid fa-robot text-primary"></i> Active AI Congestion Recommendations
          </div>
          <span class="badge badge-critical">{{ alerts.length }} Active Advisories</span>
        </div>

        <div class="alert-list">
          <div *ngFor="let alert of alerts" class="alert-box">
            <div class="alert-header">
              <span 
                class="badge" 
                [class.badge-critical]="alert.severity === 'CRITICAL'" 
                [class.badge-congested]="alert.severity === 'WARNING'" 
                [class.badge-blue]="alert.severity === 'INFO'"
              >
                {{ alert.severity }}
              </span>
              <span class="text-xs text-muted">{{ alert.timestamp }}</span>
            </div>
            <h3>{{ alert.title }}</h3>
            <p>{{ alert.message }}</p>
            <div *ngIf="alert.recommendedAction" class="rec-section">
              <strong>Action Strategy:</strong> {{ alert.recommendedAction }}
              <div class="mt-3">
                <button *ngIf="!alert.executed" class="btn btn-accent btn-sm" (click)="execute(alert.id)">
                  <i class="fa-solid fa-route"></i> Execute Reroute & Send SMS Notifications
                </button>
                <span *ngIf="alert.executed" class="text-emerald font-bold text-sm">
                  <i class="fa-solid fa-check-circle"></i> Reroute Order Dispatched to Scheduled Farmers
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Phase 2 ML Model Notice -->
      <div class="phase2-banner">
        <i class="fa-solid fa-microchip phase2-icon"></i>
        <div>
          <h3>Prototype Forecasting Note</h3>
          <p>Prices and recommendations shown here are simulated demo data. The Spring Boot service can later connect this screen to market-arrival, weather and historical mandi-price APIs.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .alert-list { display: flex; flex-direction: column; gap: 16px; }
    .forecast-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 24px; }
    .forecast-card { background: #ffffff; border: 1px solid var(--border-card); border-radius: 14px; padding: 16px; box-shadow: var(--shadow-sm); }
    .forecast-topline, .price-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .crop-name { color: var(--slate-900); font-size: 0.95rem; font-weight: 800; }
    .signal { border-radius: 999px; padding: 3px 8px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.03em; }
    .signal-up { background: #D1FAE5; color: #047857; }
    .signal-stable { background: #DBEAFE; color: #1D4ED8; }
    .signal-caution { background: #FEF3C7; color: #B45309; }
    .price-row { margin: 12px 0 5px; }
    .price-row strong { color: var(--primary-700); font-size: 1.12rem; }
    .price-row span { font-size: 0.78rem; font-weight: 800; }
    .price-up { color: #059669; }
    .price-down { color: #DC2626; }
    .forecast-card p { color: var(--text-muted); font-size: 0.75rem; }
    .alert-box { background: #ffffff; border: 1px solid var(--border-light); border-radius: 12px; padding: 20px; }
    .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .rec-section { background: #f8faf9; border-left: 4px solid var(--primary-600); padding: 12px; border-radius: 6px; margin-top: 12px; font-size: 0.875rem; }
    .mb-6 { margin-bottom: 24px; }
    .mt-3 { margin-top: 12px; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.85rem; }
    .font-bold { font-weight: 700; }
    .phase2-banner {
      background: #ffffff;
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 18px;
      box-shadow: var(--shadow-sm);
    }
    .phase2-icon { font-size: 2.2rem; color: var(--primary-700); }
    @media (max-width: 1000px) { .forecast-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px) { .forecast-grid { grid-template-columns: 1fr; } }
  `]
})
export class AiIntelligenceComponent implements OnInit {
  alerts: AIAlert[] = [];
  priceForecasts: CropPriceForecast[] = [
    { crop: 'Paddy', currentPricePerQuintal: 2310, predictedPricePerQuintal: 2380, changePercent: 3.0, market: 'Karnal Mandi', signal: 'UPWARD' },
    { crop: 'Wheat', currentPricePerQuintal: 2425, predictedPricePerQuintal: 2440, changePercent: 0.6, market: 'Panipat Mandi', signal: 'STABLE' },
    { crop: 'Mustard', currentPricePerQuintal: 5680, predictedPricePerQuintal: 5795, changePercent: 2.0, market: 'Kurukshetra Mandi', signal: 'UPWARD' },
    { crop: 'Cotton', currentPricePerQuintal: 6890, predictedPricePerQuintal: 6750, changePercent: -2.0, market: 'Ambala Mandi', signal: 'CAUTION' }
  ];

  constructor(
    private procurementService: ProcurementService,
    private mandiApiService: MandiApiService
  ) {}

  ngOnInit() {
    this.procurementService.getAIAlerts().subscribe(data => this.alerts = data);
    this.mandiApiService.getCropPriceForecasts().subscribe({
      next: (forecasts) => this.priceForecasts = forecasts,
      error: () => {
        // Demo fallback remains visible until the Spring Boot API is running.
      }
    });
  }

  execute(id: string) {
    this.procurementService.executeRerouteAction(id);
  }
}
