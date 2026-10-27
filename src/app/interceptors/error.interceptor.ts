import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const notify = inject(NotificationService);
  const goesToMockBackend = req.url.startsWith(environment.apiUrl);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      
      if (goesToMockBackend) {
        if (err.status === 401) {
          auth.logout();
          notify.error('Your session expired. Please log in again.');
          router.navigate(['/login']);
        } else if (err.status >= 500) {
          notify.error('The server had a problem. Please try again later.');
        }
      }

      return throwError(() => err);
    }),
  );
};