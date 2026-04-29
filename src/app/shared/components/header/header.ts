import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  
})
export class Header {
  // Aquí podemos inyectar un servicio de autenticación para obtener el nombre real del usuario y la lógica de cerrar sesión.
  private authService = inject(AuthService);

  userName = this.authService.currentUser()?.full_name;

    es_logeado = computed(() => !!this.authService.currentUser());

  isAdmin = computed(() => {
    const role = this.authService.getRolUsuario();
    return role === 'admin';
  });

  logout() {
    this.authService.logout();
  }
}