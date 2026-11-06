import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { Crop, PricePoint } from '../models';
import { errorMessage, shortDate } from '../utils';

interface MandiOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-history',
  imports: [FormsModule, DecimalPipe],
  template: `
    <h1>Price History</h1>
    <p class="muted">See how the price of a crop changed in a mandi. The line is the main price, the light band shows the minimum and maximum price of each day.</p>

    <div class="card filters">
      <div class="field">
        <label>Crop</label>
        <select [ngModel]="cropId()" (ngModelChange)="onCropChange($event)">
          @for (c of crops(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label>Mandi</label>
        <select [ngModel]="mandiId()" (ngModelChange)="onMandiChange($event)">
          @for (m of mandiOptions(); track m.id) {
            <option [ngValue]="m.id">{{ m.name }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label>Period</label>
        <select [ngModel]="days()" (ngModelChange)="onDaysChange($event)">
          <option [ngValue]="7">Last 7 days</option>
          <option [ngValue]="15">Last 15 days</option>
          <option [ngValue]="30">Last 30 days</option>
          <option [ngValue]="60">Last 60 days</option>
        </select>
      </div>
    </div>

    @if (error()) {
      <div class="alert error">{{ error() }}</div>
    }

    @if (stats(); as s) {
      <div class="stats">
        <div class="stat"><div class="stat-label">Latest price</div><div class="stat-value">&#8377;{{ s.latest | number:'1.0-0' }}</div></div>
        <div class="stat"><div class="stat-label">Highest</div><div class="stat-value">&#8377;{{ s.highest | number:'1.0-0' }}</div></div>
        <div class="stat"><div class="stat-label">Lowest</div><div class="stat-value">&#8377;{{ s.lowest | number:'1.0-0' }}</div></div>
        <div class="stat"><div class="stat-label">Average</div><div class="stat-value">&#8377;{{ s.average | number:'1.0-0' }}</div></div>
      </div>
    }

    <div class="card">
      @if (loading()) {
        <p class="muted">Loading chart...</p>
      } @else if (chart(); as c) {
        <svg class="chart" [attr.viewBox]="'0 0 ' + c.W + ' ' + c.H">
          @for (t of c.yTicks; track t.label) {
            <line [attr.x1]="c.L" [attr.x2]="c.W - c.R" [attr.y1]="t.y" [attr.y2]="t.y" class="grid-line" />
            <text [attr.x]="c.L - 8" [attr.y]="t.y + 4" text-anchor="end" class="axis-text">{{ t.label }}</text>
          }
          @for (t of c.xTicks; track t.label) {
            <text [attr.x]="t.x" [attr.y]="c.H - 10" text-anchor="middle" class="axis-text">{{ t.label }}</text>
          }
          <path [attr.d]="c.band" class="band" />
          <path [attr.d]="c.line" class="line" />
        </svg>
        <p class="note">Price in &#8377; per quintal.</p>
      } @else if (!error()) {
        <p class="muted">Not enough data to draw a chart.</p>
      }
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  crops = signal<Crop[]>([]);
  mandiOptions = signal<MandiOption[]>([]);
  points = signal<PricePoint[]>([]);
  loading = signal(false);
  error = signal('');
  cropId = signal<number | null>(null);
  mandiId = signal<number | null>(null);
  days = signal(30);

  stats = computed(() => {
    const list = this.points();
    if (list.length === 0) {
      return null;
    }
    return {
      latest: list[list.length - 1].modalPrice,
      highest: Math.max(...list.map((p) => p.maxPrice)),
      lowest: Math.min(...list.map((p) => p.minPrice)),
      average: list.reduce((sum, p) => sum + p.modalPrice, 0) / list.length
    };
  });

  // Everything needed to draw the SVG line chart.
  chart = computed(() => {
    const list = this.points();
    if (list.length < 2) {
      return null;
    }
    const W = 720, H = 300, L = 62, R = 16, T = 16, B = 38;
    const low = Math.min(...list.map((p) => p.minPrice));
    const high = Math.max(...list.map((p) => p.maxPrice));
    const pad = (high - low) * 0.1 || 1;
    const yMin = low - pad;
    const yMax = high + pad;
    const x = (i: number) => L + (i * (W - L - R)) / (list.length - 1);
    const y = (v: number) => T + ((yMax - v) * (H - T - B)) / (yMax - yMin);

    const line = list
      .map((p, i) => (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(p.modalPrice).toFixed(1))
      .join(' ');
    const top = list.map((p, i) => x(i).toFixed(1) + ',' + y(p.maxPrice).toFixed(1));
    const bottom = list.map((p, i) => x(i).toFixed(1) + ',' + y(p.minPrice).toFixed(1)).reverse();
    const band = 'M' + top.join(' L') + ' L' + bottom.join(' L') + ' Z';

    const yTicks = [0, 1, 2, 3, 4].map((k) => {
      const value = yMin + ((yMax - yMin) * k) / 4;
      return { y: y(value), label: String(Math.round(value)) };
    });
    const middle = Math.floor((list.length - 1) / 2);
    const xTicks = [0, middle, list.length - 1].map((i) => ({
      x: x(i),
      label: shortDate(list[i].date)
    }));

    return { W, H, L, R, line, band, yTicks, xTicks };
  });

  ngOnInit() {
    const query = this.route.snapshot.queryParamMap;
    const wantedMandi = Number(query.get('mandiId'));
    const wantedCrop = Number(query.get('cropId'));

    this.api.getCrops().subscribe({
      next: (list) => {
        this.crops.set(list);
        const chosen = list.find((c) => c.id === wantedCrop) ?? list[0];
        if (chosen) {
          this.cropId.set(chosen.id);
          this.loadMandis(wantedMandi || null);
        }
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  onCropChange(id: number) {
    this.cropId.set(id);
    this.loadMandis(this.mandiId());
  }

  onMandiChange(id: number) {
    this.mandiId.set(id);
    this.loadHistory();
  }

  onDaysChange(value: number) {
    this.days.set(value);
    this.loadHistory();
  }

  // Only the mandis that trade the selected crop are shown in the Mandi list.
  private loadMandis(preferred: number | null) {
    const crop = this.cropId();
    if (crop === null) {
      return;
    }
    this.api.getLatestPrices(crop).subscribe({
      next: (prices) => {
        this.mandiOptions.set(prices.map((p) => ({ id: p.mandiId, name: p.mandiName })));
        const pick = prices.find((p) => p.mandiId === preferred) ?? prices[0];
        if (pick) {
          this.mandiId.set(pick.mandiId);
          this.loadHistory();
        } else {
          this.mandiId.set(null);
          this.points.set([]);
        }
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  private loadHistory() {
    const mandi = this.mandiId();
    const crop = this.cropId();
    if (mandi === null || crop === null) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api.getHistory(mandi, crop, this.days()).subscribe({
      next: (list) => {
        this.points.set(list);
        this.loading.set(false);
      },
      error: (e) => {
        this.points.set([]);
        this.loading.set(false);
        this.error.set(errorMessage(e));
      }
    });
  }
}
