import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/listaUsuarios`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/usuario`);
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/admin/usuarios/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/eliminar/${id}`);
  }
}