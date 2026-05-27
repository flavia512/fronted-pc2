import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './header.html',
})
export class Header implements OnInit {
  static icono = 'bi-car-front';

  Header = Header;

  authService = inject(AuthService);
  private router = inject(Router);
  private configuracionService = inject(ConfiguracionService);

  es_logeado = computed(() => !!this.authService.usuarioActual());
  puedeExplorar = computed(() => this.authService.puedeExplorar());
  esInvitado = computed(() => this.authService.esInvitado());
  isAdmin = computed(() => this.authService.obtenerRolUsuario() === 'admin');
  nombreUsuario = computed(() => this.authService.usuarioActual()?.full_name ?? '');
  menuAbierto = signal(false);
  aviso = signal('');
  /** Alias a la señal compartida del servicio — se actualiza sola cuando admin sube logo */
  logoUrl = this.configuracionService.logoUrl;
  private avisoTimeout: any;

  ngOnInit(): void {
    this.configuracionService.cargarLogo();
  }

  toggleMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  logout(): void {
    this.authService.cerrarSesion();
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
    this.authService.cerrarSesion();
    this.cerrarMenu();
    this.router.navigate(['/login']);
  }
}
