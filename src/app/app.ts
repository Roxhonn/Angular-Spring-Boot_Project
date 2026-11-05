import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <div class="brand">
        <div class="logo">M</div>
        <div>
          <div class="brand-title">Mandi Connect Platform</div>
          <div class="brand-sub">and Crop Price Prediction &middot; Odisha</div>
        </div>
      </div>

      <nav class="menu">
        @if (auth.role() === 'FARMER') {
          <a routerLink="/prices" routerLinkActive="active">Crop Prices</a>
          <a routerLink="/history" routerLinkActive="active">Price History</a>
          <a routerLink="/mandis" routerLinkActive="active">Mandis</a>
          <a routerLink="/book" routerLinkActive="active">Book Slot</a>
        } @else if (auth.role() === 'OFFICER') {
          <a routerLink="/officer" routerLinkActive="active">My Mandi</a>
          <a routerLink="/officer-prices" routerLinkActive="active">Enter Prices</a>
          <a routerLink="/prices" routerLinkActive="active">Crop Prices</a>
          <a routerLink="/history" routerLinkActive="active">Price History</a>
        } @else if (auth.role() === 'ADMIN') {
          <a routerLink="/admin" routerLinkActive="active">Admin Panel</a>
          <a routerLink="/prices" routerLinkActive="active">Crop Prices</a>
          <a routerLink="/history" routerLinkActive="active">Price History</a>
          <a routerLink="/mandis" routerLinkActive="active">Mandis</a>
        }
      </nav>

      <div class="userbox">
        <div class="status" [class.up]="backendUp() === true" [class.down]="backendUp() === false">
          @if (backendUp() === true) { Server connected }
          @else if (backendUp() === false) { Server offline }
          @else { Checking... }
        </div>
        @if (auth.user(); as u) {
          <span class="role-chip">{{ roleLabel(u.role) }}</span>
          <span class="user-name">{{ u.name }}</span>
          <button class="btn small light" (click)="auth.logout()">Logout</button>
        }
      </div>
    </header>

    <main class="page">
      <router-outlet />
    </main>

    <footer class="footer">
      Mandi Connect Platform and Crop Price Prediction &middot; Prices shown are sample data for the project demo.
    </footer>
  `
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  backendUp = signal<boolean | null>(null);

  ngOnInit() {
    this.api.health().subscribe({
      next: () => this.backendUp.set(true),
      error: () => this.backendUp.set(false)
    });
  }

  roleLabel(role: string): string {
    return role === 'OFFICER' ? 'Mandi Officer' : role === 'ADMIN' ? 'Admin' : 'Farmer';
  }
}
