import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
// Permite acceso a invitados para rutas que lo permiten o si puede explorar ( autenticado o invitado )
  if (route.data['allowGuest'] && authService.puedeExplorar()) {
    return true;
  }
// Si esta autenticado ( tiene los datos del usuario) navega a login
  if (!authService.estaAutenticado()) {
    router.navigate(['/login'], { queryParams: { required: '1', returnUrl: state.url } });
    return false;
  }

  const esAdmin = authService.obtenerRolUsuario() === 'admin';

  // Admin solo puede acceder a /admin-users (y perfil/login/register)
  if (esAdmin && route.data['blockAdmin']) {
    router.navigate(['/admin-users']);
    return false;
  }

  const rolEsperado = route.data['rolEsperado'];
  if (rolEsperado) {
    const miRol = authService.obtenerRolUsuario();

    if (miRol !== rolEsperado) {
      router.navigate(['/home']);
      return false;
    }
  }

  return true;
};
