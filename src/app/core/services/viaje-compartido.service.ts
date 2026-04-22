import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViajeCompartido } from '../models/viaje-compartido.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViajeCompartidoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Endpoint 17: Obtener viaje compartido
  obtenerViaje(): Observable<ViajeCompartido> {
    return this.http.get<ViajeCompartido>(`${this.apiUrl}/users/obtener_viajecompartido`);
  }

  // Endpoint 19: Actualizar viaje compartido
  actualizarViaje(data: Partial<ViajeCompartido>): Observable<ViajeCompartido> {
    return this.http.put<ViajeCompartido>(`${this.apiUrl}/driver/actualizar_viaje`, data);
  }

  // Endpoint 20: Eliminar viaje compartido
  eliminarViaje(data: { id: number }): Observable<any> {
    return this.http.delete(`${this.apiUrl}/driver/eliminar_viaje`, { body: data });
  }

  // Endpoint 21: Crear viaje compartido
  crearViaje(data: {
    driver_user_id: number;
    route_id: number;
    station_name: string;
    trip_datetime: string;
    seats_total: number;
    seats_available: number;
    status: string;
  }): Observable<ViajeCompartido> {
    return this.http.post<ViajeCompartido>(`${this.apiUrl}/driver/crear_viaje`, data);
  }
}
