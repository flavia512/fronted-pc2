import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva.model';
import { environment } from '../../../environments/environment';
import {ReservasResponse} from '../../pages/reservas/reservas';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  obtenerReservasPorUsuario(userId: number): Observable<ReservasResponse> {
    return this.http.get<ReservasResponse>(`${this.apiUrl}/users/obtener_reservas`, {params: { user_id: userId }});
  }
  // Endpoint 11: Actualizar reserva
  actualizarReserva(id: number, data: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/reservas/${id}`, data);
  }

  // Endpoint 12: Crear reserva
  crearReserva(data: { user_id: number; trip_id: number; seats: number; status: string }): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.apiUrl}/users/crear_reserva`, data);
  }

  // Endpoint 13: Eliminar reserva
  eliminarReserva(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/eliminar_reserva/${id}`);
  }

  // Endpoint 14: Reservas por ruta (driver)
  reservasPorRuta(rutaId: number): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/driver/reservas`, {params: { ruta_id: rutaId }});
  }
}
