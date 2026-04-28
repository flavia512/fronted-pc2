import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta a tu auth.service

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Está logueado? 
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
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