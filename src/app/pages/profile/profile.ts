import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private userService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  usuarioId = signal<number | null>(null);
  puntos = signal<number>(0);
  isActive = signal<boolean>(false);
  rol = signal<string>('');

  cargando = signal(true);
  guardando = signal(false);
  modificandoPuntos = signal(false);

  mensajeExito = signal('');
  mensajeError = signal('');

  profileForm: FormGroup = this.fb.group({
    full_name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]],
    email: [{ value: '', disabled: true }]
  });

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    this.cargando.set(true);
    this.limpiarMensajes();

    this.userService.getProfile().subscribe({
      next: (user: User) => {
        this.usuarioId.set(user.id);
        this.puntos.set(user.puntos);
        this.isActive.set(user.is_active);
        this.rol.set(user.rol);

        this.profileForm.patchValue({
          full_name: user.full_name,
          email: user.email
        });

        this.cargando.set(false);
      },
      error: () => {
        this.mensajeError.set('No se pudo cargar el perfil. Intenta más tarde.');
        this.cargando.set(false);
      }
    });
  }

  guardarCambios(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.limpiarMensajes();

    const datosActualizados: Partial<User> = {
      full_name: this.profileForm.get('full_name')?.value
    };

    this.userService.updateProfile(datosActualizados).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensajeExito.set('Perfil actualizado correctamente.');
      },
      error: (err) => {
        console.error('Error:', err.error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo actualizar el perfil.');
      }
    });
  }

  aumentarPuntos(): void {
    this.modificandoPuntos.set(true);
    this.limpiarMensajes();

    this.userService.aumentarPuntos(10).subscribe({
      next: (res) => {
        this.puntos.set(res.puntos_totales);
        this.modificandoPuntos.set(false);
        this.mensajeExito.set(`Puntos aumentados. Total: ${res.puntos_totales}`);
      },
      error: (err) => {
        console.error('Error:', err.error);
        this.modificandoPuntos.set(false);
        this.mensajeError.set('No se pudieron aumentar los puntos.');
      }
    });
  }

  quitarPuntos(): void {
    this.modificandoPuntos.set(true);
    this.limpiarMensajes();

    this.userService.quitarPuntos(10).subscribe({
      next: (res) => {
        this.puntos.set(res.usuario.puntos);
        this.modificandoPuntos.set(false);
        this.mensajeExito.set(`Puntos actualizados. Total: ${res.usuario.puntos}`);
      },
      error: (err) => {
        console.error('Error:', err.error);
        this.modificandoPuntos.set(false);
        this.mensajeError.set('No se pudieron quitar los puntos.');
      }
    });
  }

  private limpiarMensajes(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  // Helpers para el template
  get fullNameCtrl() { return this.profileForm.get('full_name')!; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}