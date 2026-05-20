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
   * ENDPOINT 21: Crear viaje compartido
   * Ahora recibe el route_id en lugar de los textos de origen y destino.
   */
  crearViaje(data: {
    driver_user_id: number;
    route_id: number;
    origin: string;
    destiny: string;
    trip_datetime: string;
    seats_total: number;
    seats_available: number;
  }): Observable<{ success: boolean; message: string; data: ViajeCompartido }> {
    return this.http.post<{ success: boolean; message: string; data: ViajeCompartido }>(
      `${this.apiUrl}/conductor/crear_viaje`,
      data
    );
  }

  /**
   * ENDPOINT 17: Obtener datos de viaje compartido
   */
  obtenerViaje(idViaje: number): Observable<{ success: boolean; data: ViajeCompartido }> {
    return this.http.get<{ success: boolean; data: ViajeCompartido }>(
      `${this.apiUrl}/users/obtener_viajecompartido?idviaje=${idViaje}`
    );
  }

  /**
   * ENDPOINT 20: Actualizar datos de viaje compartido
   */
  actualizarViaje(idViaje: number, data: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/conductor/actualizar_viaje?idviaje=${idViaje}`,
      data
    );
  }

  /**
   * ENDPOINT 20: Eliminar viaje compartido
   */
  eliminarViaje(idViaje: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/conductor/eliminar_viaje/${idViaje}`
    );
  }

  listarViajes(): Observable<{ success: boolean; data: ViajeCompartido[] }> {
    return this.http.get<{ success: boolean; data: ViajeCompartido[] }>
      (`${this.apiUrl}/user/listar_viajes`);
  }

  /**
   * ENDPOINT buscarViajes: Buscar viajes con filtros server-side
   * GET /api/driver/buscar_viajes?origin=X&destiny=Y&fecha=YYYY-MM-DD
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
