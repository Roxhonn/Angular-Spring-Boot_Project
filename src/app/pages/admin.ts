
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

import { ApiService } from '../api.service';
import { AdminSummary, Booking, Farmer, Mandi, UserInfo } from '../models';
import { ODISHA_DISTRICTS } from '../odisha';
import { errorMessage, toDateInput } from '../utils';

interface MandiEdit {
  dailyCapacity: number;
  status: string;
}

@Component({
  selector: 'app-admin',
  imports: [FormsModule, DatePipe],
  template: `
    <h1>Admin Panel</h1>
    <p class="muted">
      Manage mandis, officer accounts and see the numbers of the platform.
    </p>

    @if (error()) {
      <div class="alert error">{{ error() }}</div>
    }

    @if (message()) {
      <div class="alert success">{{ message() }}</div>
    }

    @if (summary(); as s) {
      <div class="stats">
        <div class="stat">
          <div class="stat-label">Mandis</div>
          <div class="stat-value">{{ s.mandis }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Farmers</div>
          <div class="stat-value">{{ s.farmers }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Mandi officers</div>
          <div class="stat-value">{{ s.officers }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Bookings today</div>
          <div class="stat-value">{{ s.bookingsToday }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Price records</div>
          <div class="stat-value">{{ s.priceRecords }}</div>
        </div>
      </div>
    }

    <!-- Mandis -->
    <div class="card">
      <h3>Mandis</h3>

      <div class="table-wrap">
        <table>
          <thead>
          <tr>
            <th>Mandi</th>
            <th>District</th>
            <th>Daily slots</th>
            <th>Status</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
            @for (m of mandis(); track m.id) {
              <tr>
                <td><strong>{{ m.name }}</strong></td>
                <td>{{ m.district }}</td>
                <td>
                  <input
                    class="small-input"
                    type="number"
                    min="1"
                    [(ngModel)]="edits[m.id].dailyCapacity"
                  >
                </td>
                <td>
                  <select [(ngModel)]="edits[m.id].status">
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </td>
                <td>
                  <button class="btn small" (click)="saveMandi(m)">
                    Save
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <h3 class="sub">Add a new mandi</h3>

      <div class="form-grid">
        <div class="field">
          <label>Mandi name</label>
          <input
            [(ngModel)]="newMandi.name"
            placeholder="e.g. Rayagada Mandi"
          >
        </div>

        <div class="field">
          <label>District</label>
          <select [(ngModel)]="newMandi.district">
            <option value="" disabled>Select district</option>
            @for (d of districts; track d) {
              <option [value]="d">{{ d }}</option>
            }
          </select>
        </div>

        <div class="field">
          <label>Daily slots</label>
          <input
            type="number"
            min="1"
            [(ngModel)]="newMandi.dailyCapacity"
          >
        </div>
      </div>

      <button class="btn" (click)="addMandi()">Add mandi</button>
    </div>

    <!-- Booking Management -->
    <div class="card">
      <h3>Booking Management</h3>
      <p class="muted">
        View bookings of all mandis or select a particular mandi and date.
      </p>

      <div class="form-grid">
        <div class="field">
          <label>Select Mandi</label>
          <select
            [ngModel]="selectedMandiId()"
            (ngModelChange)="onMandiChange($event)"
          >
            <option value="">All Mandis</option>
            @for (m of mandis(); track m.id) {
              <option [value]="m.id">{{ m.name }} - {{ m.district }}</option>
            }
          </select>
        </div>

        <div class="field">
          <label>Booking Date</label>
          <input
            type="date"
            [ngModel]="bookingDate()"
            (ngModelChange)="onBookingDateChange($event)"
          >
        </div>
      </div>

      @if (bookingLoading()) {
        <p class="muted">Loading bookings...</p>
      } @else {
        <div class="stats">
          <div class="stat">
            <div class="stat-label">Total bookings</div>
            <div class="stat-value">{{ bookings().length }}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Active bookings</div>
            <div class="stat-value">{{ activeBookings() }}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Checked in</div>
            <div class="stat-value">{{ countStatus('CHECKED_IN') }}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Completed</div>
            <div class="stat-value">{{ countStatus('COMPLETED') }}</div>
          </div>

          <div class="stat">
            <div class="stat-label">Cancelled</div>
            <div class="stat-value">{{ countStatus('CANCELLED') }}</div>
          </div>
        </div>

        <p class="note">
          Daily capacity:
          <strong>{{ selectedCapacity() }}</strong>
          {{ selectedMandiId() ? 'slots' : 'combined slots across all mandis' }}
        </p>

        @if (bookings().length === 0) {
          <p class="muted">
            No bookings found for {{ bookingDate() | date:'dd MMM yyyy' }}.
          </p>
        } @else {
          <div class="table-wrap">
            <table>
              <thead>
              <tr>
                <th>Token</th>
                <th>Mandi</th>
                <th>Farmer</th>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
              </thead>

              <tbody>
                @for (b of bookings(); track b.id) {
                  <tr>
                    <td><strong>{{ b.token }}</strong></td>
                    <td>{{ b.mandiName }}</td>
                    <td>{{ b.farmerName }}</td>
                    <td>{{ b.cropName }}</td>
                    <td>{{ b.quantityQuintals }} q</td>
                    <td>{{ b.slotTime }}</td>
                    <td>
                      <span [class]="'status-pill ' + b.status.toLowerCase()">
                        {{ b.status }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>

    <!-- Officers -->
    <div class="card">
      <h3>Mandi officers</h3>

      @if (officers().length === 0) {
        <p class="muted">No officers yet.</p>
      } @else {
        <div class="table-wrap">
          <table>
            <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Mandi</th>
            </tr>
            </thead>
            <tbody>
              @for (o of officers(); track o.id) {
                <tr>
                  <td>{{ o.name }}</td>
                  <td>{{ o.username }}</td>
                  <td>{{ o.mandiName }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <h3 class="sub">Create an officer account</h3>

      <div class="form-grid">
        <div class="field">
          <label>Name</label>
          <input [(ngModel)]="newOfficer.name" placeholder="Officer name">
        </div>

        <div class="field">
          <label>Username</label>
          <input
            [(ngModel)]="newOfficer.username"
            placeholder="e.g. rayagada.officer"
          >
        </div>

        <div class="field">
          <label>Password</label>
          <input
            type="password"
            [(ngModel)]="newOfficer.password"
            placeholder="At least 6 characters"
          >
        </div>

        <div class="field">
          <label>Mandi</label>
          <select [(ngModel)]="newOfficer.mandiId">
            <option [ngValue]="0" disabled>Select mandi</option>
            @for (m of mandis(); track m.id) {
              <option [ngValue]="m.id">{{ m.name }}</option>
            }
          </select>
        </div>
      </div>

      <button class="btn" (click)="addOfficer()">Create officer</button>
    </div>

    <!-- Farmers -->
    <div class="card">
      <h3>Registered farmers ({{ farmers().length }})</h3>

      <div class="table-wrap">
        <table>
          <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Village</th>
            <th>District</th>
          </tr>
          </thead>

          <tbody>
            @for (f of farmers(); track f.id) {
              <tr>
                <td>{{ f.name }}</td>
                <td>{{ f.mobile }}</td>
                <td>{{ f.village }}</td>
                <td>{{ f.district }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);

  districts = ODISHA_DISTRICTS;

  summary = signal<AdminSummary | null>(null);
  mandis = signal<Mandi[]>([]);
  officers = signal<UserInfo[]>([]);
  farmers = signal<Farmer[]>([]);

  bookings = signal<Booking[]>([]);
  bookingLoading = signal(false);
  selectedMandiId = signal('');
  bookingDate = signal(toDateInput(new Date()));

  error = signal('');
  message = signal('');

  activeBookings = computed(() =>
    this.bookings().filter(b => b.status !== 'CANCELLED').length
  );

  selectedCapacity = computed(() => {
    const selectedId = this.selectedMandiId();

    if (selectedId) {
      return this.mandis().find(m => m.id === Number(selectedId))?.dailyCapacity ?? 0;
    }

    return this.mandis().reduce((total, m) => total + m.dailyCapacity, 0);
  });

  edits: Record<number, MandiEdit> = {};

  newMandi = {
    name: '',
    district: '',
    dailyCapacity: 50
  };

  newOfficer = {
    name: '',
    username: '',
    password: '',
    mandiId: 0
  };

  ngOnInit() {
    this.loadAll();
  }

  countStatus(status: string): number {
    return this.bookings().filter(b => b.status === status).length;
  }

  onMandiChange(value: string) {
    this.selectedMandiId.set(value);
    this.loadBookingRecords();
  }

  onBookingDateChange(value: string) {
    this.bookingDate.set(value);
    this.loadBookingRecords();
  }

  private loadBookingRecords() {
    const date = this.bookingDate();

    if (!date || this.mandis().length === 0) {
      this.bookings.set([]);
      return;
    }

    this.error.set('');
    this.bookingLoading.set(true);

    const selectedId = this.selectedMandiId();

    if (selectedId) {
      this.api.getBookingsByMandi(Number(selectedId), date).subscribe({
        next: list => {
          this.bookings.set(list);
          this.bookingLoading.set(false);
        },
        error: e => {
          this.bookings.set([]);
          this.bookingLoading.set(false);
          this.error.set(errorMessage(e));
        }
      });

      return;
    }

    const requests = this.mandis().map(m =>
      this.api.getBookingsByMandi(m.id, date)
    );

    forkJoin(requests).subscribe({
      next: results => {
        this.bookings.set(results.flat());
        this.bookingLoading.set(false);
      },
      error: e => {
        this.bookings.set([]);
        this.bookingLoading.set(false);
        this.error.set(errorMessage(e));
      }
    });
  }

  saveMandi(m: Mandi) {
    this.clearMessages();

    const edit = this.edits[m.id];

    this.api.updateMandi(m.id, {
      dailyCapacity: Number(edit.dailyCapacity),
      status: edit.status
    }).subscribe({
      next: () => {
        this.message.set(m.name + ' updated.');
        this.loadMandis();
      },
      error: e => this.error.set(errorMessage(e))
    });
  }

  addMandi() {
    this.clearMessages();

    this.api.createMandi({
      name: this.newMandi.name,
      district: this.newMandi.district,
      dailyCapacity: Number(this.newMandi.dailyCapacity)
    }).subscribe({
      next: mandi => {
        this.message.set(mandi.name + ' added.');
        this.newMandi = {
          name: '',
          district: '',
          dailyCapacity: 50
        };
        this.loadMandis();
        this.loadSummary();
      },
      error: e => this.error.set(errorMessage(e))
    });
  }

  addOfficer() {
    this.clearMessages();

    this.api.createOfficer({
      name: this.newOfficer.name,
      username: this.newOfficer.username,
      password: this.newOfficer.password,
      mandiId: Number(this.newOfficer.mandiId)
    }).subscribe({
      next: officer => {
        this.message.set('Officer account created: ' + officer.username);
        this.newOfficer = {
          name: '',
          username: '',
          password: '',
          mandiId: 0
        };
        this.loadOfficers();
        this.loadSummary();
      },
      error: e => this.error.set(errorMessage(e))
    });
  }

  private clearMessages() {
    this.error.set('');
    this.message.set('');
  }

  private loadAll() {
    this.loadSummary();
    this.loadMandis();
    this.loadOfficers();

    this.api.getAdminFarmers().subscribe({
      next: list => this.farmers.set(list),
      error: e => this.error.set(errorMessage(e))
    });
  }

  private loadSummary() {
    this.api.getAdminSummary().subscribe({
      next: s => this.summary.set(s),
      error: e => this.error.set(errorMessage(e))
    });
  }

  private loadMandis() {
    this.api.getMandis().subscribe({
      next: list => {
        this.edits = {};

        for (const m of list) {
          this.edits[m.id] = {
            dailyCapacity: m.dailyCapacity,
            status: m.status
          };
        }

        this.mandis.set(list);
        this.loadBookingRecords();
      },
      error: e => this.error.set(errorMessage(e))
    });
  }

  private loadOfficers() {
    this.api.getOfficers().subscribe({
      next: list => this.officers.set(list),
      error: e => this.error.set(errorMessage(e))
    });
  }
}
