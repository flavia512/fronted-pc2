import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

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
      if (error.status === 401 && esLlamadaAlApi) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (!router.url.includes('/login')) {
          router.navigate(['/login'], { queryParams: { expirado: '1' } });
        }
      }
      return throwError(() => error);
    })
  );
};