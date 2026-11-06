export interface Mandi {
  id: number;
  name: string;
  district: string;
  dailyCapacity: number;
  status: string;
  bookedToday: number;
}

export interface Crop {
  id: number;
  name: string;
  category: string;
}

export interface LatestPrice {
  mandiId: number;
  mandiName: string;
  district: string;
  cropId: number;
  cropName: string;
  priceDate: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  changePercent: number;
  trend: string; // RISING, STABLE or FALLING
}

export interface PricePoint {
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

export interface Farmer {
  id: number;
  name: string;
  mobile: string;
  village: string;
  district: string;
}

export interface Booking {
  id: number;
  token: string;
  farmerName: string;
  mandiName: string;
  cropName: string;
  quantityQuintals: number;
  slotDate: string;
  slotTime: string;
  status: string; // BOOKED, CHECKED_IN, COMPLETED or CANCELLED
}

export interface BookingRequest {
  mandiId: number;
  cropId: number;
  quantityQuintals: number;
  slotDate: string;
  slotTime: string;
}

/** Returned by login and register; saved in the browser so the user stays logged in. */
export interface AuthUser {
  token: string;
  role: string; // FARMER, OFFICER or ADMIN
  name: string;
  username: string;
  mandiId: number | null;
  mandiName: string | null;
  farmerId: number | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  mobile: string;
  village: string;
  district: string;
  password: string;
}

export interface PriceRequest {
  cropId: number;
  date: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
}

export interface AdminSummary {
  mandis: number;
  farmers: number;
  officers: number;
  bookingsToday: number;
  priceRecords: number;
}

export interface UserInfo {
  id: number;
  name: string;
  username: string;
  role: string;
  mandiName: string | null;
}

export interface MandiRequest {
  name: string;
  district: string;
  dailyCapacity: number;
}

export interface MandiUpdateRequest {
  dailyCapacity: number;
  status: string;
}

export interface OfficerRequest {
  name: string;
  username: string;
  password: string;
  mandiId: number;
}
