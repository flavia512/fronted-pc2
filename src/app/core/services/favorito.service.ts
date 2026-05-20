import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Favorito } from '../models/favorito.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /favoritos — favoritos del usuario autenticado
  listarFavoritos(): Observable<{ ok: boolean; favoritos: Favorito[] }> {
    return this.http.get<{ exito: boolean; datos: Favorito[] }>(`${this.apiUrl}/favoritos`)
      .pipe(map(res => ({ ok: res.exito, favoritos: res.datos ?? [] })));
  }

  // POST /favoritos
  agregarFavorito(data: { user_id: number; route_id: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/favoritos`, data);
  }

  // DELETE /favoritos?user_id=X&route_id=Y
  eliminarFavorito(user_id: number, route_id: number): Observable<any> {
    const params = new HttpParams()
      .set('user_id', user_id.toString())
      .set('route_id', route_id.toString());
    return this.http.delete(`${this.apiUrl}/favoritos`, { params });
  }
}
