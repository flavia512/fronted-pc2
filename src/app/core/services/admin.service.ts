import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getProfile(): Observable<any> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile`, data);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<{ ok: boolean; usuarios: User[] }>(`${this.apiUrl}/users/listaUsuarios`).pipe(map(response => response.usuarios));
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
