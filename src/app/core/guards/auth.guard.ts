import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (route.data['allowGuest'] && authService.canExplore()) {
    return true;
  }

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { required: '1', returnUrl: state.url } });
    return false;
  }

  const esAdmin = authService.getRolUsuario() === 'admin';

  // Admin solo puede acceder a /admin-users (y perfil/login/register)
  if (esAdmin && route.data['blockAdmin']) {
    router.navigate(['/admin-users']);
    return false;
  }

  const rolEsperado = route.data['rolEsperado'];
  if (rolEsperado) {
    const miRol = authService.getRolUsuario();

    if (miRol !== rolEsperado) {
      console.warn(`Acceso denegado. Eres ${miRol}, se requiere ${rolEsperado}`);
      router.navigate(['/admin-users']);
      return false;
    }
  }

  return true;
};
