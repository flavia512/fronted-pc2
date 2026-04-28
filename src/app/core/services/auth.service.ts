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

  readonly currentUser = signal<User | null>(this.getStoredUser());
  readonly isLoggedIn = computed(() => !!this.currentUser());

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        this.saveToken(response.access_token);
        if (response.user) {
          this.saveUser(response.user);
          this.currentUser.set(response.user);
        }
      })
    );
  }

  register(data: { full_name: string; email: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
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

  getRolUsuario(): string | null {
    const user = this.currentUser();
    return user ? user.rol : null;
  }
}