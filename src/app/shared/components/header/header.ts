import { Component, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  // Aquí podemos inyectar un servicio de autenticación para obtener el nombre real del usuario y la lógica de cerrar sesión.
  private authService = inject(AuthService);

  userName = this.authService.currentUser()?.full_name;

  isAdmin = computed(() => {
    const role = this.authService.getRolUsuario();
    console.log('rol detectado:', role);
    return role === 'admin';
  });

  logout() {
    console.log('Logout clicked');
    this.authService.logout();
  }
}