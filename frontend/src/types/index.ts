export interface AdminReservationsResponse {
  items: ReservationItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ReservationItem {
  id: string;
  email: string;
  count: number;
  age: string;
  status: string;
  createdAt: string;
  ticketNo?: string;
}

export interface AgeGroup {
  id: string;
  name: string;
  description?: string;
}

export interface CallStatus {
  id: string;
  name: string;
  description?: string;
}

export interface SystemStatus {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Checkin {
  id: string;
  reservationId: string;
  checkedInAt: string;
  notes?: string;
}