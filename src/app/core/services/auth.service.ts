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

  private apiUrl = environment.apiUrl;
  private tokenKey = 'token';
  private userKey = 'user';
  private guestKey = 'guestMode';
// se creo para que el header solo sea visto por los autenticados y para mostrar el nombre del usuario en el header
  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly guestMode = signal(this.getStoredGuestMode());
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isGuest = computed(() => this.guestMode() && !this.currentUser());
  readonly canExplore = computed(() => this.isLoggedIn() || this.isGuest());

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        this.clearGuestMode();
        this.saveToken(response.access_token);
        if (response.user) {
          this.saveUser(response.user);
          this.currentUser.set(response.user);
        }
      })
    );
  }

  register(data: { full_name: string; email: string; password: string; password_confirmation: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/registro`, data).pipe(
      tap((response) => {
        this.clearGuestMode();
        if (response.access_token) {
          this.saveToken(response.access_token);
        }
        if (response.user) {
          this.saveUser(response.user);
          this.currentUser.set(response.user);
        }
      })
    );
  }

  logout(): void {
    // Invalida token
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({ error: () => {} });
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.guestKey);
    this.currentUser.set(null);
    this.guestMode.set(false);
  }

  continueAsGuest(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.setItem(this.guestKey, '1');
    this.currentUser.set(null);
    this.guestMode.set(true);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  saveUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getStoredUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  private getStoredGuestMode(): boolean {
    return sessionStorage.getItem(this.guestKey) === '1';
  }

  private clearGuestMode(): void {
    sessionStorage.removeItem(this.guestKey);
    this.guestMode.set(false);
  }

  getRolUsuario(): string | null {
    const user = this.currentUser();
    return user ? user.rol : null;
  }
}
