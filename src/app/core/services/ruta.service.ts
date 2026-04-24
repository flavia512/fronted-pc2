import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Ruta } from '../models/ruta.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RutaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Endpoint 5 - GET /api/users/obtener_rutas
  obtenerRutas(): Observable<Ruta[]> {
    return this.http.get<any>(`${this.apiUrl}/users/obtener_rutas`).pipe(
      map(res => Array.isArray(res) ? res : res.data ?? [])
    );
  }

  // Endpoint 6 - POST /api/users/crear_rutas
  crearRuta(data: {
    nombre: string | null;
    origin_text: string;
    origin_lat: number;
    origin_lng: number;
    dest_text: string;
    dest_lat: number;
    dest_lng: number;
    hora_salida: string | null;
    duration_min: number;
    pasa_por_m30: boolean;
  }): Observable<{ success: boolean; data: Ruta }> {
    return this.http.post<{ success: boolean; data: Ruta }>(
      `${this.apiUrl}/users/crear_rutas`, data
    );
  }

  // Endpoint 8 - DELETE /api/users/delete_rutas/{id}
  eliminarRuta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/delete_rutas/${id}`);
  }
}
