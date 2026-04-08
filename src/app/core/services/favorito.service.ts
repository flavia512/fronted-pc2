import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Favorito } from '../models/favorito.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  // Endpoint 24: Añadir a favoritos
  agregarFavorito(data: { user_id: number; route_id: number }): Observable<Favorito> {
    return this.http.post<Favorito>(`${this.apiUrl}/users/agregarFavorito`, data);
  }

  // Endpoint 25: Eliminar de favoritos
  eliminarFavorito(data: { user_id: number; route_id: number }): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favoritos`, { body: data });
  }
}
