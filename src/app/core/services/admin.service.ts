import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /auth/yo
  getProfile(): Observable<User> {
    return this.http.get<{ exito: boolean; datos: User }>(`${this.apiUrl}/auth/yo`)
      .pipe(map(res => res.datos));
  }

  // PUT /usuarios/yo
  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<{ exito: boolean; datos: User }>(`${this.apiUrl}/usuarios/yo`, data)
      .pipe(map(res => res.datos));
  }

  // GET /admin/usuarios
  getAllUsers(): Observable<User[]> {
    return this.http.get<{ exito: boolean; datos: User[] }>(`${this.apiUrl}/admin/usuarios`)
      .pipe(map(res => res.datos ?? []));
  }

  // GET /auth/yo (alias, id param ignored)
  getUserById(_id: number): Observable<User> {
    return this.getProfile();
  }

  // PUT /admin/usuarios/{id}
  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<{ exito: boolean; datos: User }>(`${this.apiUrl}/admin/usuarios/${id}`, data)
      .pipe(map(res => res.datos));
  }

  // DELETE /admin/usuarios/{id}
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/usuarios/${id}`);
  }

  // PUT /usuarios/puntos/aumentar
  aumentarPuntos(cantidad: number): Observable<{ message: string; puntos_totales: number }> {
    return this.http.put<{ exito: boolean; mensaje: string; datos: { puntos_totales: number } }>(
      `${this.apiUrl}/usuarios/puntos/aumentar`,
      { cantidad }
    ).pipe(map(res => ({ message: res.mensaje, puntos_totales: res.datos.puntos_totales })));
  }

  // PUT /usuarios/puntos/quitar
  quitarPuntos(cantidad: number): Observable<{ ok: boolean; mensaje: string; usuario: User }> {
    return this.http.put<{ exito: boolean; mensaje: string; datos: User }>(
      `${this.apiUrl}/usuarios/puntos/quitar`,
      { cantidad }
    ).pipe(map(res => ({ ok: res.exito, mensaje: res.mensaje, usuario: res.datos })));
  }
}
