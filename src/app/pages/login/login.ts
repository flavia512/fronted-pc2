import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import {Header} from '../../shared/components/header/header';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private configuracionService = inject(ConfiguracionService);

  logoUrl = this.configuracionService.logoUrl;

  ngOnInit(): void {
    this.configuracionService.cargarLogo();
  }

  returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
  errorMessage = signal('');
  loading = signal(false);
  infoMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    if (this.route.snapshot.queryParamMap.get('required')) {
      this.infoMessage.set('Debes iniciar sesión para continuar con esa acción.');
    } else if (this.route.snapshot.queryParamMap.get('expired')) {
      this.infoMessage.set('Tu sesión ha caducado. Inicia sesión de nuevo.');
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.iniciarSesion(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: () => {
        this.loading.set(false);
        const esAdmin = this.authService.obtenerRolUsuario() === 'admin';
        this.router.navigateByUrl(this.returnUrl || (esAdmin ? '/admin-users' : '/rutas'));
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Credenciales incorrectas o error de servidor');
      }
    });
  }

  entrarComoInvitado(): void {
    this.authService.continuarComoInvitado();
    this.router.navigate(['/viajes-compartidos']);
  }

  protected readonly Header = Header;
}
