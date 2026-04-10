export interface ViajeCompartido {
  id: number;
  driver_user_id: number;
  route_id: number;
  station_name: string;
  trip_datetime: string;
  seats_total: number;
  seats_available: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}
