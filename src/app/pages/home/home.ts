import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class Home {
  private authService = inject(AuthService);
  private router      = inject(Router);

  readonly estaAutenticado = this.authService.estaAutenticado;

  entrarComoInvitado(): void {
    this.authService.continuarComoInvitado();
    this.router.navigate(['/viajes-compartidos']);
  }
}