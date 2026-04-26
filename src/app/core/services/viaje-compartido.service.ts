import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ViajeCompartido } from '../models/viaje-compartido.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ViajeCompartidoService {

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  //Lista de los viajes
  listarViajes(): Observable<{ success: boolean; data: ViajeCompartido[] }> {
    return this.http.get<{ success: boolean; data: ViajeCompartido[] }>(
      `${this.apiUrl}/users/viajes_compartidos`
    );
  }

  // Obtener uno
  obtenerViaje(id: number): Observable<ViajeCompartido> {
    return this.http.get<ViajeCompartido>(
      `${this.apiUrl}/users/obtener_viajecompartido/${id}`
    );
  }

  // Crear viaje
  crearViaje(data: {
    driver_user_id: number;
    route_id: number;
    origin: string;
    destiny: string;
    trip_datetime: string;
    seats_total: number;
    seats_available: number;
    status: string;
  }): Observable<ViajeCompartido> {
    return this.http.post<ViajeCompartido>(`${this.apiUrl}/driver/crear_viaje`, data);
  }


  // Eliminar viaje
  eliminarViaje(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/driver/eliminar_viaje/${id}`
    );
  }
}
