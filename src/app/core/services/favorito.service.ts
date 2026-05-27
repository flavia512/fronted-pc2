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
  agregarFavorito(route_id: number): Observable<{ exito: boolean; datos: Favorito }> {
    return this.http.post<{ exito: boolean; datos: Favorito }>(`${this.apiUrl}/favoritos`, { route_id });
  }

  // DELETE /favoritos?route_id=Y
  eliminarFavorito(route_id: number): Observable<{ exito: boolean; mensaje: string }> {
    const params = new HttpParams().set('route_id', route_id.toString());
    return this.http.delete<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/favoritos`, { params });
  }
}
