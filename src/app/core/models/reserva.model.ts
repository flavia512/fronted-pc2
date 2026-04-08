export interface Reserva {
  id: number;
  user_id: number;
  trip_id: number;
  seats: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}
