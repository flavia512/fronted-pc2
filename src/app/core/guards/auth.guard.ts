import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta a tu auth.service

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

<<<<<<< HEAD
  if (route.data['allowGuest'] && authService.canExplore()) {
    return true;
  }

  // Está logueado?
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { required: '1', returnUrl: state.url } });
=======
  // Está logueado?
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
>>>>>>> 217a6f310f99b2ffa12e3ff5d74683b842555c9f
    return false;
  }
  //Exige un rol específico esta ruta?
  const rolEsperado = route.data['rolEsperado'];
  if (rolEsperado) {
    const miRol = authService.getRolUsuario();

    if (miRol !== rolEsperado) {
      console.warn(`Acceso denegado. Eres ${miRol}, se requiere ${rolEsperado}`);
      router.navigate(['/']);
      return false;
    }
  }
  return true;
};
