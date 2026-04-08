export interface Alerta {
  id: number;
  route_id: number;
  user_id: number;
  for_datetime: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}
