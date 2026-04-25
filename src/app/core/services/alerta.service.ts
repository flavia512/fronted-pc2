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
}
