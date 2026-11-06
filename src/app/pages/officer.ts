import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Booking, Mandi } from '../models';
import { errorMessage, toDateInput } from '../utils';

@Component({
  selector: 'app-officer',
  imports: [FormsModule, DatePipe],
  template: `
    <h1>{{ auth.user()?.mandiName }}</h1>
    <p class="muted">Slots booked in your mandi. Check in a farmer when he or she arrives, and mark the booking completed when the sale is done.</p>

    <div class="card filters">
      <div class="field">
        <label>Date</label>
        <input type="date" [ngModel]="date()" (ngModelChange)="onDateChange($event)">
      </div>
      @if (mandi(); as m) {
        <div class="field">
          <label>Mandi status</label>
          <div><span class="badge" [class.green]="m.status === 'OPEN'" [class.red]="m.status !== 'OPEN'">{{ m.status }}</span></div>
        </div>
      }
    </div>

    @if (error()) {
      <div class="alert error">{{ error() }}</div>
    }

    <div class="stats">
      <div class="stat"><div class="stat-label">Active bookings</div><div class="stat-value">{{ active() }}</div><div class="stat-note">of {{ mandi()?.dailyCapacity ?? 0 }} slots</div></div>
      <div class="stat"><div class="stat-label">Waiting</div><div class="stat-value">{{ count('BOOKED') }}</div></div>
      <div class="stat"><div class="stat-label">Checked in</div><div class="stat-value">{{ count('CHECKED_IN') }}</div></div>
      <div class="stat"><div class="stat-label">Completed</div><div class="stat-value">{{ count('COMPLETED') }}</div></div>
    </div>

    <div class="card">
      @if (bookings().length === 0) {
        <p class="muted">No bookings on {{ date() | date:'dd MMM yyyy' }}.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead><tr><th>Token</th><th>Farmer</th><th>Crop</th><th>Quantity</th><th>Time</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              @for (b of bookings(); track b.id) {
                <tr>
                  <td><strong>{{ b.token }}</strong></td>
                  <td>{{ b.farmerName }}</td>
                  <td>{{ b.cropName }}</td>
                  <td>{{ b.quantityQuintals }} q</td>
                  <td>{{ b.slotTime }}</td>
                  <td><span [class]="'status-pill ' + b.status.toLowerCase()">{{ b.status }}</span></td>
                  <td class="actions">
                    @if (b.status === 'BOOKED') {
                      <button class="btn small" (click)="setStatus(b, 'CHECKED_IN')">Check in</button>
                      <button class="btn small outline" (click)="setStatus(b, 'CANCELLED')">Cancel</button>
                    } @else if (b.status === 'CHECKED_IN') {
                      <button class="btn small" (click)="setStatus(b, 'COMPLETED')">Complete</button>
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
export class OfficerComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  mandi = signal<Mandi | null>(null);
  bookings = signal<Booking[]>([]);
  error = signal('');
  date = signal(toDateInput(new Date()));

  active = computed(() => this.bookings().filter((b) => b.status !== 'CANCELLED').length);

  ngOnInit() {
    const mandiId = this.auth.user()?.mandiId;
    if (mandiId == null) {
      this.error.set('No mandi is linked with this officer account.');
      return;
    }
    this.api.getMandi(mandiId).subscribe({
      next: (m) => this.mandi.set(m),
      error: (e) => this.error.set(errorMessage(e))
    });
    this.loadBookings();
  }

  count(status: string): number {
    return this.bookings().filter((b) => b.status === status).length;
  }

  onDateChange(value: string) {
    this.date.set(value);
    this.loadBookings();
  }

  setStatus(booking: Booking, status: string) {
    this.api.updateBookingStatus(booking.id, status).subscribe({
      next: () => this.loadBookings(),
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  private loadBookings() {
    const mandiId = this.auth.user()?.mandiId;
    if (mandiId == null || !this.date()) {
      return;
    }
    this.error.set('');
    this.api.getBookingsByMandi(mandiId, this.date()).subscribe({
      next: (list) => this.bookings.set(list),
      error: (e) => {
        this.bookings.set([]);
        this.error.set(errorMessage(e));
      }
    });
  }
}
