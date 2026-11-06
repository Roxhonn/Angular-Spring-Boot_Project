import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './config';
import {
  AdminSummary, Booking, BookingRequest, Crop, Farmer, LatestPrice, Mandi, MandiRequest,
  MandiUpdateRequest, OfficerRequest, PricePoint, PriceRequest, UserInfo
} from './models';

/** All calls to the Spring Boot backend (except login) are in this one file. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  health() {
    return this.http.get<{ status: string }>(`${API_URL}/health`);
  }

  // ---- prices, crops, mandis (all logged-in users) ----
  getCrops() {
    return this.http.get<Crop[]>(`${API_URL}/crops`);
  }

  getMandis(district?: string) {
    let params = new HttpParams();
    if (district) {
      params = params.set('district', district);
    }
    return this.http.get<Mandi[]>(`${API_URL}/mandis`, { params });
  }

  getMandi(id: number) {
    return this.http.get<Mandi>(`${API_URL}/mandis/${id}`);
  }

  getLatestPrices(cropId: number, district?: string) {
    let params = new HttpParams().set('cropId', cropId);
    if (district) {
      params = params.set('district', district);
    }
    return this.http.get<LatestPrice[]>(`${API_URL}/prices/latest`, { params });
  }

  getHistory(mandiId: number, cropId: number, days: number) {
    const params = new HttpParams().set('mandiId', mandiId).set('cropId', cropId).set('days', days);
    return this.http.get<PricePoint[]>(`${API_URL}/prices/history`, { params });
  }

  // ---- farmer ----
  createBooking(body: BookingRequest) {
    return this.http.post<Booking>(`${API_URL}/bookings`, body);
  }

  getMyBookings() {
    return this.http.get<Booking[]>(`${API_URL}/bookings/my`);
  }

  cancelMyBooking(id: number) {
    return this.http.patch<Booking>(`${API_URL}/bookings/${id}/cancel`, null);
  }

  // ---- mandi officer ----
  savePrice(body: PriceRequest) {
    return this.http.post<LatestPrice>(`${API_URL}/prices`, body);
  }

  getBookingsByMandi(mandiId: number, date: string) {
    const params = new HttpParams().set('mandiId', mandiId).set('date', date);
    return this.http.get<Booking[]>(`${API_URL}/bookings`, { params });
  }

  updateBookingStatus(id: number, status: string) {
    const params = new HttpParams().set('status', status);
    return this.http.patch<Booking>(`${API_URL}/bookings/${id}/status`, null, { params });
  }

  // ---- admin ----
  getAdminSummary() {
    return this.http.get<AdminSummary>(`${API_URL}/admin/summary`);
  }

  createMandi(body: MandiRequest) {
    return this.http.post<Mandi>(`${API_URL}/admin/mandis`, body);
  }

  updateMandi(id: number, body: MandiUpdateRequest) {
    return this.http.patch<Mandi>(`${API_URL}/admin/mandis/${id}`, body);
  }

  getOfficers() {
    return this.http.get<UserInfo[]>(`${API_URL}/admin/officers`);
  }

  createOfficer(body: OfficerRequest) {
    return this.http.post<UserInfo>(`${API_URL}/admin/officers`, body);
  }

  getAdminFarmers() {
    return this.http.get<Farmer[]>(`${API_URL}/admin/farmers`);
  }
}
