import { Component, OnInit, inject } from '@angular/core';
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

  cargando: boolean = true;
  guardando: boolean = false;
  error: string = '';

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    this.cargando = true;
    this.error = '';

    // Simulando la llamada al backend (Endpoint 1 - show)
    // this.userService.getProfile().subscribe({...})
    setTimeout(() => {
      // Así responderá exactamente tu backend
      this.usuario = {
        id: 10,
        email: 'juan@ejemplo.com',
        full_name: 'Juan Pérez',
        puntos: 150,
        is_active: true,
        rol: 'user',
        last_login_at: '2026-04-20 10:00:00'
      };
      this.cargando = false;
    }, 800);
  }

  guardarCambios(): void {
    this.guardando = true;
    this.error = '';

    // Preparamos solo los datos que el backend permite editar (Endpoint 18)
    const datosActualizados = {
      full_name: this.usuario.full_name
      // El backend también permite email e is_active, pero en tu diseño 
      // el email está deshabilitado para edición, lo cual es buena práctica.
    };

    console.log('Enviando a Laravel:', datosActualizados);

    // Simulación de guardado
    setTimeout(() => {
      this.guardando = false;
      alert('Perfil actualizado correctamente');
    }, 1000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}