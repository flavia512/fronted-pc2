import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ruta } from '../models/ruta.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RutaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /rutas — rutas del usuario autenticado
  obtenerRutas(): Observable<{ exito: boolean; datos: Ruta[] }> {
    return this.http.get<{ exito: boolean; datos: Ruta[] }>(`${this.apiUrl}/rutas`);
  }

  // GET /rutas/todas — todas las rutas públicas
  listarRutasPublicas(): Observable<{ exito: boolean; datos: Ruta[] }> {
    return this.http.get<{ exito: boolean; datos: Ruta[] }>(`${this.apiUrl}/rutas/todas`);
  }

  // POST /rutas
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
  }): Observable<{ exito: boolean; datos: Ruta }> {
    return this.http.post<{ exito: boolean; datos: Ruta }>(`${this.apiUrl}/rutas`, data);
  }

  // DELETE /rutas/{id}
  eliminarRuta(id: number): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.delete<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/rutas/${id}`);
  }
}
