export interface Alerta {
  id: number;
  route_id: number;
  user_id: number;
  for_datetime: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  ruta?: {
    id: number;
    nombre: string | null;
    origin_text: string;
    dest_text: string;
    hora_salida: string | null;
    pasa_por_m30: boolean;
  };
}
