import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ViajeCompartido } from '../models/viaje-compartido.model';

@Injectable({
  providedIn: 'root'
})
export class ViajeCompartidoService {
  private http    = inject(HttpClient);
  private apiUrl  = environment.apiUrl;

  // POST /viajes
  crearViaje(data: {
    route_id: number;
    trip_datetime: string;
    seats_total: number;
    seats_available: number;
  }): Observable<{ exito: boolean; mensaje: string; datos: ViajeCompartido }> {
    return this.http.post<{ exito: boolean; mensaje: string; datos: ViajeCompartido }>(
      `${this.apiUrl}/viajes`,
      data
    );
  }

  // GET /viajes/:id
  obtenerViaje(idViaje: number): Observable<{ exito: boolean; datos: ViajeCompartido }> {
    return this.http.get<{ exito: boolean; datos: ViajeCompartido }>(
      `${this.apiUrl}/viajes/${idViaje}`
    );
  }

  // PUT /viajes/:id
  actualizarViaje(idViaje: number, data: Partial<ViajeCompartido>): Observable<{ exito: boolean; datos: ViajeCompartido }> {
    return this.http.put<{ exito: boolean; datos: ViajeCompartido }>(
      `${this.apiUrl}/viajes/${idViaje}`,
      data
    );
  }

  // DELETE /viajes/:id
  eliminarViaje(idViaje: number): Observable<{ exito: boolean; mensaje: string }> {
    return this.http.delete<{ exito: boolean; mensaje: string }>(
      `${this.apiUrl}/viajes/${idViaje}`
    );
  }

  // GET /viajes
  listarViajes(): Observable<{ exito: boolean; datos: ViajeCompartido[] }> {
    return this.http.get<{ exito: boolean; datos: ViajeCompartido[] }>(`${this.apiUrl}/viajes`);
  }

  // GET /viajes/buscar
  buscarViajes(filtros: { origin?: string; destiny?: string; fecha?: string }): Observable<{ exito: boolean; datos: ViajeCompartido[] }> {
    const params: Record<string, string> = {};
    if (filtros.origin?.trim())  params['origin']  = filtros.origin.trim();
    if (filtros.destiny?.trim()) params['destiny'] = filtros.destiny.trim();
    if (filtros.fecha)           params['fecha']   = filtros.fecha;

    return this.http.get<{ exito: boolean; datos: ViajeCompartido[] }>(
      `${this.apiUrl}/viajes/buscar`,
      { params }
    );
  }
}
