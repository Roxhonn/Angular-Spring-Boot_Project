import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { AuthUser, LoginRequest, RegisterRequest } from './models';

const STORAGE_KEY = 'mandi_connect_user';

/** Login, logout and the logged-in user (kept in the browser so a refresh does not log out). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  user = signal<AuthUser | null>(this.readStored());
  role = computed(() => this.user()?.role ?? null);
  isLoggedIn = computed(() => this.user() !== null);

  login(body: LoginRequest) {
    return this.http.post<AuthUser>(`${API_URL}/auth/login`, body).pipe(tap((u: AuthUser) => this.save(u)));
  }

  register(body: RegisterRequest) {
    return this.http.post<AuthUser>(`${API_URL}/auth/register`, body).pipe(tap((u: AuthUser) => this.save(u)));
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    return this.user()?.token ?? null;
  }

  /** The first page of each portal. */
  homePath(): string {
    switch (this.role()) {
      case 'OFFICER':
        return '/officer';
      case 'ADMIN':
        return '/admin';
      default:
        return '/prices';
    }
  }

  private save(user: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private readStored(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
