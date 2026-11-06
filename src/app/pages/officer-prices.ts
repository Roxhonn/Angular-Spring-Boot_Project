import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Crop, LatestPrice } from '../models';
import { errorMessage, toDateInput } from '../utils';

@Component({
  selector: 'app-officer-prices',
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <h1>Enter Prices - {{ auth.user()?.mandiName }}</h1>
    <p class="muted">Enter the price of a crop in your mandi. Farmers see the new price on the Crop Prices page. If a price already exists for that crop and date, it is replaced.</p>

    <div class="card">
      <div class="form-grid">
        <div class="field">
          <label>Crop</label>
          <select [ngModel]="cropId()" (ngModelChange)="onCropChange($event)">
            @for (c of crops(); track c.id) {
              <option [ngValue]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
        <div class="field">
          <label>Date</label>
          <input type="date" [max]="today" [(ngModel)]="date">
        </div>
        <div class="field"><label>Minimum price (&#8377;/quintal)</label><input type="number" min="1" [(ngModel)]="minPrice"></div>
        <div class="field"><label>Modal price (&#8377;/quintal)</label><input type="number" min="1" [(ngModel)]="modalPrice"></div>
        <div class="field"><label>Maximum price (&#8377;/quintal)</label><input type="number" min="1" [(ngModel)]="maxPrice"></div>
      </div>

      @if (current(); as c) {
        <p class="note">Current price of {{ c.cropName }} in your mandi: &#8377;{{ c.modalPrice | number:'1.0-0' }} per quintal on {{ c.priceDate | date:'dd MMM yyyy' }}.</p>
      }

      <button class="btn" (click)="save()" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Save price' }}</button>

      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }
      @if (saved(); as s) {
        <div class="alert success">
          Price saved: {{ s.cropName }} &#8377;{{ s.modalPrice | number:'1.0-0' }} per quintal ({{ s.priceDate | date:'dd MMM yyyy' }}).
        </div>
      }
    </div>
  `
})
export class OfficerPricesComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  crops = signal<Crop[]>([]);
  cropId = signal<number | null>(null);
  current = signal<LatestPrice | null>(null);
  saved = signal<LatestPrice | null>(null);
  error = signal('');
  saving = signal(false);

  today = toDateInput(new Date());
  date = toDateInput(new Date());
  minPrice: number | null = null;
  modalPrice: number | null = null;
  maxPrice: number | null = null;

  ngOnInit() {
    this.api.getCrops().subscribe({
      next: (list) => {
        this.crops.set(list);
        if (list.length > 0) {
          this.onCropChange(list[0].id);
        }
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  // Shows the current price of the crop in this mandi and fills the boxes with it.
  onCropChange(id: number) {
    this.cropId.set(id);
    this.saved.set(null);
    const mandiId = this.auth.user()?.mandiId;
    this.api.getLatestPrices(id).subscribe({
      next: (list) => {
        const mine = list.find((p) => p.mandiId === mandiId) ?? null;
        if (mine) {
          this.minPrice = mine.minPrice;
          this.modalPrice = mine.modalPrice;
          this.maxPrice = mine.maxPrice;
        } else {
          this.minPrice = null;
          this.modalPrice = null;
          this.maxPrice = null;
        }
        this.current.set(mine);
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  save() {
    this.error.set('');
    this.saved.set(null);
    const crop = this.cropId();
    if (crop === null || !this.date || this.minPrice === null || this.modalPrice === null || this.maxPrice === null) {
      this.error.set('Please fill all the price boxes.');
      return;
    }
    this.saving.set(true);
    this.api.savePrice({
      cropId: crop,
      date: this.date,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      modalPrice: this.modalPrice
    }).subscribe({
      next: (price) => {
        this.saved.set(price);
        this.saving.set(false);
        this.current.set(price);
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.saving.set(false);
      }
    });
  }
}
