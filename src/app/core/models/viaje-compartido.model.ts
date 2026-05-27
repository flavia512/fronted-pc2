export interface ViajeCompartido {
  id: number;
  driver_user_id: number;
  route_id: number;
  origin?: string;
  destiny?: string;
  station_name?: string;
  trip_datetime: string;
  seats_total: number;
  seats_available: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  conductor?: { id?: number; name?: string; full_name?: string; email?: string };
  reservas?: Array<{
    id: number;
    user_id: number;
    trip_id: number;
    seats: number;
    status: string;
    usuario?: { id?: number; full_name?: string; email?: string };
  }>;
}
