import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alerta } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  // Endpoint 15: Desactivar alerta
  desactivarAlerta(data: { route_id: number; user_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/desactivar_alerta`, data);
  }

  // Endpoint 16: Obtener alerta del usuario
  obtenerAlertaUsuario(): Observable<Alerta> {
    return this.http.get<Alerta>(`${this.apiUrl}/users/obtener_alerta`);
  }
}
