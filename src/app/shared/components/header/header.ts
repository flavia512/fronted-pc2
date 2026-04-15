import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  // Aquí podemos inyectar un servicio de autenticación para obtener el nombre real del usuario y la lógica de cerrar sesión.
  userName = 'Juan EJMEPLO';

  logout() {
    console.log('Logout clicked');
    // Implementar lógica de logout
  }
}