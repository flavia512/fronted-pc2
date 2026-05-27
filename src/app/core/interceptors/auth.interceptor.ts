import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.obtenerToken();
  const esLlamadaAlApi = req.url.startsWith(environment.apiUrl);
  const peticionConToken = token && esLlamadaAlApi
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(peticionConToken).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && esLlamadaAlApi && !authService.esInvitado()) {
        authService.limpiarAutenticacion();
        if (!router.url.includes('/login')) {
          router.navigate(['/login'], { queryParams: { expirado: '1' } });
        }
      }
      return throwError(() => error);
    })
  );
};