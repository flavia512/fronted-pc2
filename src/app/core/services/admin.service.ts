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

  // GET /usuarios/yo — Usado en: profile.ts (cargarDatosUsuario)
  getProfile(): Observable<User> {
    return this.http.get<{ exito: boolean; datos: User }>(`${this.apiUrl}/usuarios/yo`)
      .pipe(map(res => res.datos));
  }

  // PUT /usuarios/yo — Usado en: profile.ts (guardarCambios)
  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<{ exito: boolean; datos: User }>(`${this.apiUrl}/usuarios/yo`, data)
      .pipe(map(res => res.datos));
  }

  // GET /admin/usuarios — Usado en: admin-users.ts (cargarUsuarios)
  getAllUsers(): Observable<User[]> {
    return this.http.get<{ exito: boolean; datos: User[] }>(`${this.apiUrl}/admin/usuarios`)
      .pipe(map(res => res.datos ?? []));
  }

  // GET /usuarios/yo (alias, id param ignorado) — no usado actualmente
  getUserById(_id: number): Observable<User> {
    return this.getProfile();
  }

  // PUT /admin/usuarios/{id} — Usado en: admin-users.ts (guardarEdicion)
  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<{ exito: boolean; datos: User }>(`${this.apiUrl}/admin/usuarios/${id}`, data)
      .pipe(map(res => res.datos));
  }

  // GET /admin/estadisticas — Usado en: admin-users.ts (cargarEstadisticas)
  getEstadisticas(): Observable<{ total: number; admins: number; activos: number }> {
    return this.http.get<{ exito: boolean; datos: { total: number; admins: number; activos: number } }>(
      `${this.apiUrl}/admin/estadisticas`
    ).pipe(map(res => res.datos));
  }

  // POST /admin/usuarios — Usado en: admin-users.ts (crearUsuario)
  crearUsuario(data: { full_name: string; email: string; password: string; rol: string }): Observable<User> {
    return this.http.post<{ exito: boolean; datos: User }>(`${this.apiUrl}/admin/usuarios`, data)
      .pipe(map(res => res.datos));
  }

  // DELETE /admin/usuarios/{id} — Usado en: admin-users.ts (eliminarUsuario)
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/usuarios/${id}`);
  }

  // PUT /usuarios/puntos/aumentar — Usado en: profile.ts (aumentarPuntos)
  aumentarPuntos(cantidad: number): Observable<{ message: string; puntos_totales: number }> {
    return this.http.put<{ exito: boolean; mensaje: string; datos: { puntos_totales: number } }>(
      `${this.apiUrl}/usuarios/puntos/aumentar`,
      { cantidad }
    ).pipe(map(res => ({ message: res.mensaje, puntos_totales: res.datos.puntos_totales })));
  }

  // PUT /usuarios/puntos/quitar — Usado en: profile.ts (quitarPuntos)
  quitarPuntos(cantidad: number): Observable<{ ok: boolean; mensaje: string; usuario: User }> {
    return this.http.put<{ exito: boolean; mensaje: string; datos: User }>(
      `${this.apiUrl}/usuarios/puntos/quitar`,
      { cantidad }
    ).pipe(map(res => ({ ok: res.exito, mensaje: res.mensaje, usuario: res.datos })));
  }
}
