export interface Ruta {
  id: number;
  user_id: number;
  nombre: string | null;
  origin_text: string;
  origin_lat: number;
  origin_lng: number;
  dest_text: string;
  dest_lat: number;
  dest_lng: number;
  arrival_time: string | null;
  duration_min: number | null;
  hora_salida: string | null;
  pasa_por_m30: boolean;
  created_at?: string;
  updated_at?: string;
}
