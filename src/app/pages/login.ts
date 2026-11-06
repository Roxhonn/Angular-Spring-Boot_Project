import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { errorMessage } from '../utils';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="login-layout">
      <!-- Left side: MandiConnect image -->
      <div class="login-visual">
        <img
          src="assets/images/mandiconnect-banner.png"
          alt="MandiConnect - Smart Mandi. Prosperous Farmers."
        />
      </div>

      <!-- Right side: Existing login form -->
      <div class="login-panel">
        <div class="auth-card card">
          <h1>Welcome Back!</h1>
          <p class="muted">
            Farmers, mandi officers and admins login here. Farmers use their mobile number as
            username.
          </p>

          <div class="field">
            <label>Username</label>
            <input
              [(ngModel)]="username"
              placeholder="Mobile number or username"
              autocomplete="username"
            />
          </div>

          <div class="field">
            <label>Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              placeholder="Password"
              autocomplete="current-password"
              (keyup.enter)="login()"
            />
          </div>

          @if (error()) {
            <div class="alert error">{{ error() }}</div>
          }

          <button class="btn full" (click)="login()" [disabled]="loading()">
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>

          <p class="note center">
            New farmer?
            <a routerLink="/register">Create an account</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .login-layout {
        display: flex;
        min-height: 100vh;
        width: 100%;
        background: #f5f8f3;
      }

      .login-visual {
        width: 55%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: linear-gradient(135deg, #e7f5e8, #f7fbf4);
        overflow: hidden;
      }

      .login-visual img {
        display: block;
        width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 18px;
      }

      .login-panel {
        width: 45%;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }

      .auth-card {
        width: 100%;
        max-width: 440px;
        padding: 36px;
        border-radius: 20px;
        background: #ffffff;
        box-shadow: 0 12px 40px rgba(0, 60, 25, 0.09);
      }

      .auth-card h1 {
        color: #075c2b;
        font-size: 32px;
        margin-bottom: 10px;
      }

      .auth-card .field {
        margin-top: 22px;
      }

      .auth-card input {
        width: 100%;
        box-sizing: border-box;
      }

      .auth-card .btn {
        margin-top: 24px;
      }

      @media (max-width: 768px) {
        .login-layout {
          flex-direction: column;
        }

        .login-visual {
          width: 100%;
          min-height: auto;
          padding: 16px;
        }

        .login-visual img {
          max-height: 260px;
        }

        .login-panel {
          width: 100%;
          min-height: auto;
          box-sizing: border-box;
          padding: 24px 16px;
        }

        .auth-card {
          padding: 26px;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  login() {
    this.error.set('');

    if (!this.username.trim() || !this.password) {
      this.error.set('Please enter username and password.');
      return;
    }

    this.loading.set(true);

    this.auth
      .login({
        username: this.username.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate([this.auth.homePath()]);
        },
        error: (e) => {
          this.loading.set(false);
          this.error.set(errorMessage(e));
        },
      });
  }
}
