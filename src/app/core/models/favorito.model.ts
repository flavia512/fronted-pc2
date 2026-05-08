export interface Favorito {
  user_id: number;
  route_id: number;
  ruta?: {
    id: number;
    nombre: string;
    origin_text: string;
    dest_text: string;
    hora_salida: string;
    pasa_por_m30: boolean;
  };
}
