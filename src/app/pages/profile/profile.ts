import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

export interface UsuarioPerfil {
  nombre: string;
  email: string;
  telefono: string;
  verificado: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: UsuarioPerfil = {
    nombre: '',
    email: '',
    telefono: '',
    verificado: false
  };

  cargando: boolean = true;
  guardando: boolean = false;
  error: string = '';

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    this.cargando = true;
    this.error = '';

    this.userService.getProfile().subscribe({
      next: (user: User) => {
        this.usuario = {
          nombre: user.full_name,
          email: user.email,
          telefono: '', // El backend no devuelve teléfono, mantener vacío
          verificado: user.is_active || false
        };
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el perfil. Intenta más tarde.';
        this.cargando = false;
      }
    });
  }

  guardarCambios(): void {
    this.guardando = true;
    this.error = '';

    const datosActualizados: Partial<User> = {
      full_name: this.usuario.nombre
    };

    this.userService.updateProfile(datosActualizados).subscribe({
      next: () => {
        this.guardando = false;
        alert('Perfil actualizado correctamente');
      },
      error: () => {
        this.guardando = false;
        this.error = 'No se pudo actualizar el perfil. Intenta más tarde.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}