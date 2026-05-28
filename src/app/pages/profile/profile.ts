import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private userService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  usuarioId = signal<number | null>(null);
  isActive = signal<boolean>(false);
  rol = signal<string>('');

  cargando = signal(true);
  guardando = signal(false);

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

    this.userService.obtenerPerfil().subscribe({
      next: (res) => {
        const user = res.datos;
        this.usuarioId.set(user.id);
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

    this.userService.actualizarPerfil(datosActualizados).subscribe({
      next: () => {
        this.guardando.set(false);
        this.mensajeExito.set('Perfil actualizado correctamente.');
      },
      error: () => {
        this.guardando.set(false);
        this.mensajeError.set('No se pudo actualizar el perfil.');
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
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}