import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',

})
export class Login {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
<<<<<<< HEAD
  private router = inject(Router);
  private route = inject(ActivatedRoute);
=======
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);
>>>>>>> 217a6f310f99b2ffa12e3ff5d74683b842555c9f

  returnUrl    = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
  errorMessage = signal('');
<<<<<<< HEAD
  loading = signal(false);
  infoMessage = signal('');
=======
  loading      = signal(false);
>>>>>>> 217a6f310f99b2ffa12e3ff5d74683b842555c9f

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
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

    this.authService.login(this.form.getRawValue() as { email: string; password: string }).subscribe({
      next: () => {
        this.loading.set(false);
<<<<<<< HEAD
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/rutas');
=======
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/rutas';
        this.router.navigateByUrl(returnUrl);
>>>>>>> 217a6f310f99b2ffa12e3ff5d74683b842555c9f
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Credenciales incorrectas o error de servidor');
      }
    });
  }

  entrarComoInvitado(): void {
    this.authService.continueAsGuest();
    this.router.navigate(['/viajes-compartidos']);
  }
}
