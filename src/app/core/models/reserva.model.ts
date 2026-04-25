export interface Reserva {
  id: number;
  user_id: number;
  trip_id: number;
  seats: number;
  status: string;
  created_at?: string;
  updated_at?: string;

  // Relación del backend (muestra la ruta reservada)
  viaje?: {
    origin: string;
    destiny: string;
    trip_datetime: string;
  };
}