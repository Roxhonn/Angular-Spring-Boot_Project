import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { Mandi } from '../models';
import { errorMessage } from '../utils';

@Component({
  selector: 'app-mandis',
  imports: [FormsModule, RouterLink],
  template: `
    <h1>Mandis</h1>
    <p class="muted">Mandis of Odisha with the number of slots booked today.</p>

    <div class="card filters">
      <div class="field">
        <label>District</label>
        <select [ngModel]="district()" (ngModelChange)="district.set($event)">
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

    <div class="cards">
      @for (m of filtered(); track m.id) {
        <div class="card mandi-card">
          <div class="row">
            <h3>{{ m.name }}</h3>
            <span class="badge" [class.green]="m.status === 'OPEN'" [class.red]="m.status !== 'OPEN'">{{ m.status }}</span>
          </div>
          <p class="muted">{{ m.district }} district</p>
          <div class="bar"><div class="bar-fill" [style.width.%]="percent(m)"></div></div>
          <p class="note">{{ m.bookedToday }} of {{ m.dailyCapacity }} slots booked today</p>
          @if (auth.role() === 'FARMER') {
            <a class="btn small" routerLink="/book" [queryParams]="{ mandiId: m.id }">Book slot</a>
          }
        </div>
      }
    </div>
  `
})
export class MandisComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);

  mandis = signal<Mandi[]>([]);
  error = signal('');
  district = signal('');

  districts = computed(() => [...new Set(this.mandis().map((m) => m.district))].sort());
  filtered = computed(() =>
    this.district() ? this.mandis().filter((m) => m.district === this.district()) : this.mandis()
  );

  ngOnInit() {
    this.api.getMandis().subscribe({
      next: (list) => this.mandis.set(list),
      error: (e) => this.error.set(errorMessage(e))
    });
  }

  percent(m: Mandi): number {
    return m.dailyCapacity === 0 ? 0 : Math.min(100, Math.round((m.bookedToday / m.dailyCapacity) * 100));
  }
}
