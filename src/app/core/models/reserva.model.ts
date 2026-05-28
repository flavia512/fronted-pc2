export interface Reserva {
  id: number;
  user_id: number;
  trip_id: number;
  seats: number;
  status: string;
  created_at?: string;
  updated_at?: string;

  // (muestra la ruta reservada) es decir añade datos a la reserva 
  viaje?: {
    origin: string;
    destiny: string;
    trip_datetime: string;
    conductor?: {
      full_name?: string;
      email?: string;
    };
  };
}