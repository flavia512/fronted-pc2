import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerta } from '../models/alerta.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Endpoint 15: POST /api/users/desactivar_alerta?idruta=X
  desactivarAlerta(idruta: number): Observable<any> {
    const params = new HttpParams().set('idruta', idruta.toString());
    return this.http.post(`${this.apiUrl}/users/desactivar_alerta`, {}, { params });
  }

  // Endpoint 16: GET /api/users/obtener_alerta?user_id=X
  obtenerAlertaUsuario(user_id: number): Observable<{ ok: boolean; alertas: Alerta[] }> {
    const params = new HttpParams().set('user_id', user_id.toString());
    return this.http.get<{ ok: boolean; alertas: Alerta[] }>(`${this.apiUrl}/users/obtener_alerta`, { params });
  }

  // Endpoint 5: POST /api/users/crear_alerta
  crearAlerta(data: { route_id: number; for_datetime: string }): Observable<{ ok: boolean; alerta: Alerta }> {
    return this.http.post<{ ok: boolean; alerta: Alerta }>(`${this.apiUrl}/users/crear_alerta`, data);
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
}
