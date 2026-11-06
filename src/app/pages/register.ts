import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { ODISHA_DISTRICTS } from '../odisha';
import { errorMessage } from '../utils';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-card card">
      <h1>Farmer Registration</h1>
      <p class="muted">Create your account. Your mobile number will be your username.</p>

      <div class="field"><label>Full name</label><input [(ngModel)]="name" placeholder="Your name"></div>
      <div class="field"><label>Mobile number</label><input [(ngModel)]="mobile" maxlength="10" placeholder="10 digit mobile number"></div>
      <div class="field"><label>Village</label><input [(ngModel)]="village" placeholder="Village"></div>
      <div class="field">
        <label>District</label>
        <select [(ngModel)]="district">
          <option value="" disabled>Select district</option>
          @for (d of districts; track d) {
            <option [value]="d">{{ d }}</option>
          }
        </select>
      </div>
      <div class="field"><label>Password</label><input type="password" [(ngModel)]="password" placeholder="At least 6 characters"></div>
      <div class="field"><label>Confirm password</label><input type="password" [(ngModel)]="confirm" placeholder="Type the password again"></div>

      @if (error()) {
        <div class="alert error">{{ error() }}</div>
      }

      <button class="btn full" (click)="register()" [disabled]="loading()">{{ loading() ? 'Please wait...' : 'Register' }}</button>
      <p class="note center">Already registered? <a routerLink="/login">Login</a></p>
    </div>
  `
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  districts = ODISHA_DISTRICTS;
  name = '';
  mobile = '';
  village = '';
  district = '';
  password = '';
  confirm = '';
  loading = signal(false);
  error = signal('');

  register() {
    this.error.set('');
    if (this.password !== this.confirm) {
      this.error.set('Both passwords must be the same.');
      return;
    }
    this.loading.set(true);
    this.auth.register({
      name: this.name,
      mobile: this.mobile,
      village: this.village,
      district: this.district,
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([this.auth.homePath()]);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(errorMessage(e));
      }
    });
  }
}
