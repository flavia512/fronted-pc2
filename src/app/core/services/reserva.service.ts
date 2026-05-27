import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reserva } from '../models/reserva.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /reservas — reservas del usuario autenticado
  obtenerReservasPorUsuario(): Observable<{ ok: boolean; reservas: Reserva[] }> {
    return this.http.get<{ exito: boolean; datos: Reserva[] }>(`${this.apiUrl}/reservas`)
      .pipe(map(res => ({ ok: res.exito, reservas: res.datos ?? [] })));
  }

  // PUT /reservas/{id}
  actualizarReserva(id: number, data: Partial<Reserva>): Observable<Reserva> {
    return this.http.put<{ exito: boolean; datos: Reserva }>(`${this.apiUrl}/reservas/${id}`, data)
      .pipe(map(res => res.datos));
  }

  // POST /reservas
  crearReserva(data: { trip_id: number; seats: number; status: string }): Observable<{ exito: boolean; mensaje: string; datos: Reserva }> {
    return this.http.post<{ exito: boolean; mensaje: string; datos: Reserva }>(`${this.apiUrl}/reservas`, data);
  }

  // DELETE /reservas/{id}
  eliminarReserva(id: number): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.delete<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/reservas/${id}`);
  }

  // GET /admin/reservas/ruta?ruta_id=X
  reservasPorRuta(rutaId: number): Observable<{ exito: boolean; datos: any[] }> {
    return this.http.get<{ exito: boolean; datos: any[] }>(`${this.apiUrl}/admin/reservas/ruta`, { params: { ruta_id: rutaId } })
      .pipe(map(res => ({ exito: res.exito, datos: res.datos ?? [] })));
  }
}
