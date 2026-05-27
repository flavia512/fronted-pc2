import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import {Header} from '../../shared/components/header/header';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configuracionService = inject(ConfiguracionService);

  returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';

  logoUrl = this.configuracionService.logoUrl;

  ngOnInit(): void {
    this.configuracionService.cargarLogo();
  }

  errorMessage = signal('');
  successMessage = signal('');
  loading = signal(false);

  form = this.fb.group({
    full_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.registrar(this.form.getRawValue() as {
      full_name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Usuario registrado correctamente');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/rutas';
        this.router.navigateByUrl(returnUrl);
      },
      // MEJORA: Ahora capturamos el error que manda Laravel
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);

        // Si es un error 422 (Validación de Laravel)
        if (err.status === 422 && err.error && err.error.errors) {
          const erroresLaravel = err.error.errors;

          if (erroresLaravel.email) {
            this.errorMessage.set('Este correo electrónico ya está registrado.');
          } else if (erroresLaravel.password) {
            this.errorMessage.set('La contraseña no cumple los requisitos mínimos.');
          } else {
            this.errorMessage.set('Verifica los datos introducidos.');
          }
        } else {
          // Si es otro error (como que el servidor se apagó)
          this.errorMessage.set('Error de conexión con el servidor.');
        }

        // Imprimimos el error completo en consola para depurar
        console.error('Error detallado de Laravel:', err);
      }
    });
  }

  protected readonly Header = Header;
}
