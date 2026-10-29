import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { AdminUser } from '../models/procurement.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Prototype Demo Account (To be replaced with Spring Security + OAuth2 / Government SSO in production)
  private readonly DEMO_USERNAME = 'govadmin';
  private readonly DEMO_PASSWORD = 'Agri@2026';
  private readonly SESSION_KEY = 'agriprocure_gov_admin_session';

  private defaultAdminUser: AdminUser = {
    id: 'GOV-001',
    name: 'Shri R.K. Sharma',
    role: 'GOVERNMENT_ADMIN',
    department: 'Mandi Operations & Price Intelligence',
    avatarText: 'RK',
    email: 'rk.sharma@gov.in'
  };

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentAdminSubject = new BehaviorSubject<AdminUser | null>(null);
  currentAdmin$ = this.currentAdminSubject.asObservable();

  constructor(private router: Router) {
    this.restoreSession();
  }

  /** Initialize session from sessionStorage for prototype session persistence */
  private restoreSession() {
    const sessionData = sessionStorage.getItem(this.SESSION_KEY);
    if (sessionData) {
      try {
        const admin: AdminUser = JSON.parse(sessionData);
        this.currentAdminSubject.next(admin);
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  /**
   * Demo Authentication Login
   * Prototype note: Production deployment will authenticate via server-side JWT / OAuth2 government SSO
   */
  login(usernameInput: string, passwordInput: string): Observable<{ success: boolean; message?: string }> {
    const trimmedUsername = (usernameInput || '').trim().toLowerCase();
    
    // Validate credentials against prototype demo account
    if (trimmedUsername === this.DEMO_USERNAME && passwordInput === this.DEMO_PASSWORD) {
      const admin = this.defaultAdminUser;
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(admin));
      this.currentAdminSubject.next(admin);
      this.isAuthenticatedSubject.next(true);
      return of({ success: true });
    } else {
      return of({ 
        success: false, 
        message: 'Invalid Government ID or Password. Please verify your credentials.' 
      });
    }
  }

  /** Logout admin officer and redirect to /login */
  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  private clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentAdminSubject.next(null);
  }

  /** Check current auth status synchronously */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
