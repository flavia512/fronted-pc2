export interface User {
  id: number;
  email: string;
  full_name: string;
  puntos: number;
  is_active: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
  rol: string;
}