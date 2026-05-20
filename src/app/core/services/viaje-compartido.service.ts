import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // Ajusta esta ruta si es diferente en tu proyecto

// Interfaz para tipar lo que nos devuelve el backend (puedes moverla a un archivo model si lo prefieres)
export interface ViajeCompartido {
  id: number;
  driver_user_id: number;
  route_id: number;
  origin?: string;
  destiny?: string;
  trip_datetime: string;
  seats_total: number;
  seats_available: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViajeCompartidoService {
  // Usamos la URL base de tus environments (ej: http://localhost:8000/api)
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * POST /viajes
   */
  crearViaje(data: {
    route_id: number;
    trip_datetime: string;
    seats_total: number;
    seats_available: number;
  }): Observable<{ success: boolean; message: string; data: ViajeCompartido }> {
    return this.http.post<{ exito: boolean; mensaje: string; datos: ViajeCompartido }>(
      `${this.apiUrl}/viajes`,
      data
    ).pipe(map(res => ({ success: res.exito, message: res.mensaje, data: res.datos })));
  }

  /**
   * GET /viajes/{idViaje}
   */
  obtenerViaje(idViaje: number): Observable<{ success: boolean; data: ViajeCompartido }> {
    return this.http.get<{ exito: boolean; datos: ViajeCompartido }>(
      `${this.apiUrl}/viajes/${idViaje}`
    ).pipe(map(res => ({ success: res.exito, data: res.datos })));
  }

  /**
   * PUT /viajes/{idViaje}
   */
  actualizarViaje(idViaje: number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/viajes/${idViaje}`,
      data
    );
  }

  /**
   * DELETE /viajes/{idViaje}
   */
  eliminarViaje(idViaje: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/viajes/${idViaje}`
    );
  }

  // GET /viajes
  listarViajes(): Observable<{ success: boolean; data: ViajeCompartido[] }> {
    return this.http.get<{ exito: boolean; datos: ViajeCompartido[] }>(`${this.apiUrl}/viajes`)
      .pipe(map(res => ({ success: res.exito, data: res.datos ?? [] })));
  }

  /**
   * buscarViajes: filtra client-side sobre listarViajes()
   */
  buscarViajes(filtros: { origin?: string; destiny?: string; fecha?: string }): Observable<{ success: boolean; data: ViajeCompartido[] }> {
    return this.listarViajes().pipe(
      map(res => {
        const origin = filtros.origin?.trim().toLowerCase();
        const destiny = filtros.destiny?.trim().toLowerCase();
        const fecha = filtros.fecha;

        const data = res.data.filter(viaje => {
          const coincideOrigen = !origin || (viaje.origin ?? '').toLowerCase().includes(origin);
          const coincideDestino = !destiny || (viaje.destiny ?? '').toLowerCase().includes(destiny);
          const coincideFecha = !fecha || viaje.trip_datetime?.startsWith(fecha);

          return coincideOrigen && coincideDestino && coincideFecha;
        });

        return { ...res, data };
      })
    );
  }
}
