import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /usuarios/yo — Usado en: profile.ts (cargarDatosUsuario)
  obtenerPerfil(): Observable<{ exito: boolean; datos: User }> {
    return this.http.get<{ exito: boolean; datos: User }>(`${this.apiUrl}/usuarios/yo`);
  }

  // PUT /usuarios/yo — Usado en: profile.ts (guardarCambios)
  actualizarPerfil(data: Partial<User>): Observable<{ exito: boolean; datos: User }> {
    return this.http.put<{ exito: boolean; datos: User }>(`${this.apiUrl}/usuarios/yo`, data);
  }

  // GET /admin/usuarios — Usado en: admin-users.ts (cargarUsuarios)
  obtenerTodos(): Observable<{ exito: boolean; datos: User[] }> {
    return this.http.get<{ exito: boolean; datos: User[] }>(`${this.apiUrl}/admin/usuarios`);
  }

  // PUT /admin/usuarios/{id} — Usado en: admin-users.ts (guardarEdicion)
  actualizarUsuario(id: number, data: Partial<User>): Observable<{ exito: boolean; datos: User }> {
    return this.http.put<{ exito: boolean; datos: User }>(`${this.apiUrl}/admin/usuarios/${id}`, data);
  }

  // GET /admin/estadisticas — Usado en: admin-users.ts (cargarEstadisticas)
  obtenerEstadisticas(): Observable<{ exito: boolean; datos: { total: number; admins: number; activos: number } }> {
    return this.http.get<{ exito: boolean; datos: { total: number; admins: number; activos: number } }>(
      `${this.apiUrl}/admin/estadisticas`
    );
  }

  // POST /admin/usuarios — Usado en: admin-users.ts (crearUsuario)
  crearUsuario(data: { full_name: string; email: string; password: string; rol: string }): Observable<{ exito: boolean; datos: User }> {
    return this.http.post<{ exito: boolean; datos: User }>(`${this.apiUrl}/admin/usuarios`, data);
  }

  // DELETE /admin/usuarios/{id} — Usado en: admin-users.ts (eliminarUsuario)
  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/usuarios/${id}`);
  }

}
