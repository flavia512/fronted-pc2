import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Usamos directamente el modelo de la base de datos
  usuario: Partial<User> = {};

  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    this.cargando.set(true);
    this.error.set('');

    this.userService.getProfile().subscribe({
      next: (user: User) => {
        this.usuario = {
          full_name: user.full_name,
          email: user.email,
          puntos: user.puntos,
          is_active: user.is_active,
          rol: user.rol
        };
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil. Intenta más tarde.');
        this.cargando.set(false);
      }
    });
  }

  guardarCambios(): void {
    this.guardando.set(true);
    this.error.set('');

    const datosActualizados: Partial<User> = {
      full_name: this.usuario.full_name
    };

    this.userService.updateProfile(datosActualizados).subscribe({
      next: () => {
        this.guardando.set(false);
        alert('Perfil actualizado correctamente');
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo actualizar el perfil. Intenta más tarde.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}