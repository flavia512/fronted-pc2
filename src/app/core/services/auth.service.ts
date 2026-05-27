import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
//Constantes internas  
  private apiUrl = environment.apiUrl;
  private tokenKey = 'token';
  private userKey = 'user';
  private guestKey = 'guestMode';

  readonly usuarioActual = signal<User | null>(this.obtenerUsuarioGuardado());
  readonly modoInvitado = signal(this.obtenerModoInvitadoGuardado());
  readonly estaAutenticado = computed(() => !!this.usuarioActual());
  readonly esInvitado = computed(() => this.modoInvitado() && !this.usuarioActual());
  readonly puedeExplorar = computed(() => this.estaAutenticado() || this.esInvitado());

  iniciarSesion(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        this.limpiarModoInvitado();
        this.guardarToken(response.access_token);
        if (response.user) {
          this.guardarUsuario(response.user);
          this.usuarioActual.set(response.user);
        }
      })
    );
  }

  registrar(data: { full_name: string; email: string; password: string; password_confirmation: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/registro`, data).pipe(
      tap((response) => {
        this.limpiarModoInvitado();
        if (response.access_token) {
          this.guardarToken(response.access_token);
        }
        if (response.user) {
          this.guardarUsuario(response.user);
          this.usuarioActual.set(response.user);
        }
      })
    );
  }

  cerrarSesion(): void {
    // Invalida token
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.guestKey);
    this.usuarioActual.set(null);
    this.modoInvitado.set(false);
  }

  continuarComoInvitado(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.setItem(this.guestKey, '1');
    this.usuarioActual.set(null);
    this.modoInvitado.set(true);
  }

  private guardarToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private guardarUsuario(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private obtenerUsuarioGuardado(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  private obtenerModoInvitadoGuardado(): boolean {
    return sessionStorage.getItem(this.guestKey) === '1';
  }

  private limpiarModoInvitado(): void {
    sessionStorage.removeItem(this.guestKey);
    this.modoInvitado.set(false);
  }
// Metodo utilizado en auth.guard.ts para verificar el rol de admin
  obtenerRolUsuario(): string | null {
    const user = this.usuarioActual();
    return user ? user.rol : null;
  }

  limpiarAutenticacion(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.usuarioActual.set(null);
    this.modoInvitado.set(false);
  }
}
