import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    route_id: number;
    trip_datetime: string;
    seats_total: number;
    seats_available: number;
  }): Observable<{ success: boolean; message: string; data: ViajeCompartido }> {
    return this.http.post<{ success: boolean; message: string; data: ViajeCompartido }>(
      `${this.apiUrl}/driver/crear_viaje`,
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
      `${this.apiUrl}/driver/actualizar_viaje?idviaje=${idViaje}`,
      data
    );
  }

  /**
   * ENDPOINT 20: Eliminar viaje compartido
   */
  eliminarViaje(idViaje: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/driver/eliminar_viaje?idviaje=${idViaje}`
    );
  }

  listarViajes(): Observable<{ success: boolean; data: ViajeCompartido[] }> {
    return this.http.get<{ success: boolean; data: ViajeCompartido[] }>
      (`${this.apiUrl}/driver/listar_viajes`);
  }
}