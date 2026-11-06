import { DecimalPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Crop, LatestPrice, Mandi } from '../models';
import { errorMessage } from '../utils';

@Component({
  selector: 'app-prices',
  imports: [FormsModule, RouterLink, DecimalPipe, DatePipe],
  template: `
    <h1>Crop Prices in Odisha Mandis</h1>
    <p class="muted">Choose a crop to see its latest price in every mandi. The mandi with the highest price is shown first.</p>

    <div class="card filters">
      <div class="field">
        <label>Crop</label>
        <select [ngModel]="cropId()" (ngModelChange)="cropId.set($event); loadPrices()">
          @for (c of crops(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label>District</label>
        <select [ngModel]="district()" (ngModelChange)="district.set($event); loadPrices()">
          <option value="">All districts</option>
          @for (d of districts(); track d) {
            <option [value]="d">{{ d }}</option>
          }
        </select>
      </div>
    </div>

    @if (error()) {
      <div class="alert error">{{ error() }}</div>
    }

    @if (best(); as b) {
      <div class="stats">
        <div class="stat">
          <div class="stat-label">Best mandi to sell</div>
          <div class="stat-value">{{ b.mandiName }}</div>
          <div class="stat-note">{{ b.district }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Highest price</div>
          <div class="stat-value">&#8377;{{ b.modalPrice | number:'1.0-0' }}</div>
          <div class="stat-note">per quintal</div>
        </div>
        <div class="stat">
          <div class="stat-label">Lowest price</div>
          <div class="stat-value">&#8377;{{ lowest()?.modalPrice | number:'1.0-0' }}</div>
          <div class="stat-note">{{ lowest()?.mandiName }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Average price</div>
          <div class="stat-value">&#8377;{{ average() | number:'1.0-0' }}</div>
          <div class="stat-note">across {{ prices().length }} mandis</div>
        </div>
      </div>
    }

    <div class="card">
      @if (loading()) {
        <p class="muted">Loading prices...</p>
      } @else if (prices().length === 0 && !error()) {
        <p class="muted">No price data found.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Mandi</th><th>District</th><th>Price (&#8377;/quintal)</th>
                <th>Min - Max</th><th>7-day change</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of prices(); track p.mandiId; let i = $index) {
                <tr [class.best-row]="i === 0">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <strong>{{ p.mandiName }}</strong>
                    @if (i === 0) { <span class="badge green">Best price</span> }
                  </td>
                  <td>{{ p.district }}</td>
                  <td><strong>{{ p.modalPrice | number:'1.0-0' }}</strong></td>
                  <td>{{ p.minPrice | number:'1.0-0' }} - {{ p.maxPrice | number:'1.0-0' }}</td>
                  <td>
                    <span class="trend" [class.up]="p.trend === 'RISING'" [class.down]="p.trend === 'FALLING'">
                      @if (p.trend === 'RISING') { &#9650; }
                      @else if (p.trend === 'FALLING') { &#9660; }
                      @else { &#9644; }
                      {{ p.changePercent }}% {{ p.trend.toLowerCase() }}
                    </span>
                  </td>
                  <td>{{ p.priceDate | date:'dd MMM yyyy' }}</td>
                  <td class="actions">
                    <a class="btn small outline" routerLink="/history"
                       [queryParams]="{ mandiId: p.mandiId, cropId: p.cropId }">History</a>
                    @if (auth.role() === 'FARMER') {
                      <a class="btn small" routerLink="/book"
                         [queryParams]="{ mandiId: p.mandiId, cropId: p.cropId }">Book slot</a>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="note">7-day change compares today's price with the average of the previous 7 days. It shows what already happened, it is not a prediction.</p>
      }
    </div>
  `
})
export class PricesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  crops = signal<Crop[]>([]);
  mandis = signal<Mandi[]>([]);
  prices = signal<LatestPrice[]>([]);
  loading = signal(false);
  error = signal('');
  cropId = signal<number | null>(null);
  district = signal('');

  districts = computed(() => [...new Set(this.mandis().map((m) => m.district))].sort());
  best = computed(() => this.prices()[0] ?? null);
  lowest = computed(() => {
    const list = this.prices();
    return list.length ? list[list.length - 1] : null;
  });
  average = computed(() => {
    const list = this.prices();
    return list.length ? list.reduce((sum, p) => sum + p.modalPrice, 0) / list.length : 0;
  });

  ngOnInit() {
    this.api.getMandis().subscribe({
      next: (m) => this.mandis.set(m),
      error: (e) => this.error.set(errorMessage(e))
    });
    this.api.getCrops().subscribe({
      next: (list) => {
        this.crops.set(list);
        if (list.length > 0) {
          this.cropId.set(list[0].id);
          this.loadPrices();
        }
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  loadPrices() {
    const id = this.cropId();
    if (id === null) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api.getLatestPrices(id, this.district() || undefined).subscribe({
      next: (list) => {
        this.prices.set(list);
        this.loading.set(false);
      },
      error: (e) => {
        this.prices.set([]);
        this.loading.set(false);
        this.error.set(errorMessage(e));
      }
    });
  }
}
