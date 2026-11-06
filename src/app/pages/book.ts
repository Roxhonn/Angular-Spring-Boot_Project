import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Booking, Crop, LatestPrice } from '../models';
import { errorMessage, toDateInput } from '../utils';

@Component({
  selector: 'app-book',
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <h1>Book a Mandi Slot</h1>
    <p class="muted">Choose your crop, pick a mandi (with its latest price) and book a time slot. You will get a token number.</p>

    <div class="card">
      <h3>Slot details for {{ auth.user()?.name }}</h3>
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
          <label>Mandi (highest price first)</label>
          <select [ngModel]="mandiId()" (ngModelChange)="mandiId.set($event)">
            @for (m of mandiOptions(); track m.mandiId) {
              <option [ngValue]="m.mandiId">{{ m.mandiName }} - &#8377;{{ m.modalPrice | number:'1.0-0' }}/quintal</option>
            }
          </select>
        </div>
        <div class="field">
          <label>Quantity (quintals)</label>
          <input type="number" min="1" [(ngModel)]="quantity" placeholder="e.g. 25">
        </div>
        <div class="field">
          <label>Date</label>
          <input type="date" [min]="today" [(ngModel)]="slotDate">
        </div>
        <div class="field">
          <label>Time slot</label>
          <select [(ngModel)]="slotTime">
            @for (s of slots; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
      </div>

      <button class="btn" (click)="book()" [disabled]="saving()">{{ saving() ? 'Booking...' : 'Book slot' }}</button>

      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }
      @if (result(); as r) {
        <div class="alert success">
          Slot booked. Your token number is <strong>{{ r.token }}</strong> &mdash;
          {{ r.cropName }}, {{ r.quantityQuintals }} quintals at {{ r.mandiName }},
          {{ r.slotDate | date:'dd MMM yyyy' }} ({{ r.slotTime }}).
        </div>
      }
    </div>

    <div class="card">
      <h3>My bookings</h3>
      @if (bookings().length === 0) {
        <p class="muted">No bookings yet.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead><tr><th>Token</th><th>Crop</th><th>Mandi</th><th>Quantity</th><th>Date</th><th>Time</th><th>Status</th><th></th></tr></thead>
            <tbody>
              @for (b of bookings(); track b.id) {
                <tr>
                  <td><strong>{{ b.token }}</strong></td>
                  <td>{{ b.cropName }}</td>
                  <td>{{ b.mandiName }}</td>
                  <td>{{ b.quantityQuintals }} q</td>
                  <td>{{ b.slotDate | date:'dd MMM yyyy' }}</td>
                  <td>{{ b.slotTime }}</td>
                  <td><span [class]="'status-pill ' + b.status.toLowerCase()">{{ b.status }}</span></td>
                  <td>
                    @if (b.status === 'BOOKED') {
                      <button class="btn small outline" (click)="cancel(b)">Cancel</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class BookComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  crops = signal<Crop[]>([]);
  mandiOptions = signal<LatestPrice[]>([]);
  bookings = signal<Booking[]>([]);
  result = signal<Booking | null>(null);
  error = signal('');
  saving = signal(false);

  cropId = signal<number | null>(null);
  mandiId = signal<number | null>(null);

  quantity: number | null = null;
  today = toDateInput(new Date());
  slotDate = toDateInput(new Date(Date.now() + 24 * 60 * 60 * 1000)); // tomorrow
  slotTime = '10:00-11:00';
  slots = ['08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00'];

  ngOnInit() {
    const query = this.route.snapshot.queryParamMap;
    const wantedMandi = Number(query.get('mandiId'));
    const wantedCrop = Number(query.get('cropId'));

    this.loadBookings();
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
    this.loadMandis(null);
  }

  // Mandis that trade the selected crop, highest price first. The best mandi is pre-selected.
  private loadMandis(preferred: number | null) {
    const crop = this.cropId();
    if (crop === null) {
      return;
    }
    this.api.getLatestPrices(crop).subscribe({
      next: (list) => {
        this.mandiOptions.set(list);
        const pick = list.find((p) => p.mandiId === preferred) ?? list[0];
        this.mandiId.set(pick ? pick.mandiId : null);
      },
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  book() {
    this.error.set('');
    this.result.set(null);
    const crop = this.cropId();
    const mandi = this.mandiId();

    if (crop === null || mandi === null) {
      this.error.set('Please select a crop and a mandi.');
      return;
    }
    if (this.quantity === null || this.quantity <= 0) {
      this.error.set('Please enter the quantity in quintals.');
      return;
    }

    this.saving.set(true);
    this.api.createBooking({
      mandiId: mandi,
      cropId: crop,
      quantityQuintals: this.quantity,
      slotDate: this.slotDate,
      slotTime: this.slotTime
    }).subscribe({
      next: (booking) => {
        this.result.set(booking);
        this.saving.set(false);
        this.loadBookings();
      },
      error: (e) => {
        this.error.set(errorMessage(e));
        this.saving.set(false);
      }
    });
  }

  cancel(booking: Booking) {
    this.api.cancelMyBooking(booking.id).subscribe({
      next: () => this.loadBookings(),
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  private loadBookings() {
    this.api.getMyBookings().subscribe({
      next: (list) => this.bookings.set(list),
      error: (e) => this.error.set(errorMessage(e))
    });
  }
}
