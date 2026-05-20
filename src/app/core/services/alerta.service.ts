import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Alerta } from '../models/alerta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // PUT /alertas/desactivar?idruta=X
  desactivarAlerta(idruta: number): Observable<any> {
    const params = new HttpParams().set('idruta', idruta.toString());
    return this.http.put(`${this.apiUrl}/alertas/desactivar`, {}, { params });
  }

  // GET /alertas — alertas del usuario autenticado
  obtenerAlertaUsuario(_user_id?: number): Observable<{ ok: boolean; alertas: Alerta[] }> {
    return this.http.get<{ exito: boolean; datos: Alerta[] }>(`${this.apiUrl}/alertas`)
      .pipe(map(res => ({ ok: res.exito, alertas: res.datos ?? [] })));
  }

  // POST /alertas
  crearAlerta(data: { route_id: number; for_datetime: string }): Observable<{ ok: boolean; alerta: Alerta }> {
    return this.http.post<{ exito: boolean; datos: Alerta }>(`${this.apiUrl}/alertas`, data)
      .pipe(map(res => ({ ok: res.exito, alerta: res.datos })));
  }

  // PC1 FastAPI: GET http://localhost:8001/predict?fecha=YYYY-MM-DD&hora=HH:MM
  predecirTrafico(fecha: string, hora: string): Observable<{
    ok: boolean;
    nivel_gravedad: number;
    descripcion: string;
    minutos_antes: number;
    recomendacion: string;
    color: string;
  }> {
    const params = new HttpParams().set('fecha', fecha).set('hora', hora);
    return this.http.get<any>('http://localhost:8001/predict', { params });
  }

  // POST /predicciones — Usado en: alertas.ts (crearAlerta, fire-and-forget)
  guardarPrediccion(data: { route_id: number; resultado: string; ml_model_id?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/predicciones`, data);
  }
}
