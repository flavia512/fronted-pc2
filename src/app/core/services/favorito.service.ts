import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorito } from '../models/favorito.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Endpoint 26: Listar favoritos del usuario autenticado
  listarFavoritos(): Observable<{ ok: boolean; favoritos: Favorito[] }> {
    return this.http.get<{ ok: boolean; favoritos: Favorito[] }>(`${this.apiUrl}/users/listar_favoritos`);
  }

  // Endpoint 24: Añadir a favoritos
  agregarFavorito(data: { user_id: number; route_id: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/agregar_favorito`, data);
  }

  // Endpoint 25: Eliminar de favoritos (query params, no body)
  eliminarFavorito(user_id: number, route_id: number): Observable<any> {
    const params = new HttpParams()
      .set('user_id', user_id.toString())
      .set('route_id', route_id.toString());
    return this.http.delete(`${this.apiUrl}/favoritos`, { params });
  }
}
