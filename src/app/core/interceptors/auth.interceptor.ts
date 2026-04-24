import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const isApiRequest = req.url.includes('localhost:8000');

  const authReq = token && isApiRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isApiRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!router.url.includes('/login')) {
          router.navigate(['/login'], { queryParams: { expired: '1' } });
        }
      }
      return throwError(() => err);
    })
  );
};
