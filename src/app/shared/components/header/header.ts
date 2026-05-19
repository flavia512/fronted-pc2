import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  es_logeado = computed(() => !!this.authService.currentUser());
  puedeExplorar = computed(() => this.authService.canExplore());
  esInvitado = computed(() => this.authService.isGuest());
  isAdmin = computed(() => this.authService.getRolUsuario() === 'admin');
  menuAbierto = signal(false);
  aviso = signal('');
  private avisoTimeout: any;

  toggleMenu(): void {
    this.menuAbierto.update(v => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.cerrarMenu();
  }

  pedirLogin(): void {
    this.aviso.set('Debes iniciar sesión para continuar con esa acción.');
    this.cerrarMenu();

    if (this.avisoTimeout) {
      clearTimeout(this.avisoTimeout);
    }

    this.avisoTimeout = setTimeout(() => this.aviso.set(''), 3500);
  }

  irLogin(): void {
    this.authService.logout();
    this.cerrarMenu();
    this.router.navigate(['/login']);
  }
}
