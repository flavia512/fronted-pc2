import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva } from '../models/reserva.model';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  // Endpoint 10: Obtener reservas por usuario
  obtenerReservasPorUsuario(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/users/obtener_reservas`);
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
  reservasPorRuta(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/driver/reservas`);
  }
}
