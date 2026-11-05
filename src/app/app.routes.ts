import { Routes } from '@angular/router';
import { guestGuard, roleGuard } from './guards';
import { LoginComponent } from './pages/login';
import { RegisterComponent } from './pages/register';
import { PricesComponent } from './pages/prices';
import { HistoryComponent } from './pages/history';
import { MandisComponent } from './pages/mandis';
import { BookComponent } from './pages/book';
import { OfficerComponent } from './pages/officer';
import { OfficerPricesComponent } from './pages/officer-prices';
import { AdminComponent } from './pages/admin';

export const routes: Routes = [
  { path: '', redirectTo: 'prices', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  // any logged-in user
  { path: 'prices', component: PricesComponent, canActivate: [roleGuard()] },
  { path: 'history', component: HistoryComponent, canActivate: [roleGuard()] },
  { path: 'mandis', component: MandisComponent, canActivate: [roleGuard()] },

  // farmer portal
  { path: 'book', component: BookComponent, canActivate: [roleGuard('FARMER')] },

  // mandi officer portal
  { path: 'officer', component: OfficerComponent, canActivate: [roleGuard('OFFICER')] },
  { path: 'officer-prices', component: OfficerPricesComponent, canActivate: [roleGuard('OFFICER')] },

  // admin portal
  { path: 'admin', component: AdminComponent, canActivate: [roleGuard('ADMIN')] },

  { path: '**', redirectTo: 'prices' }
];
