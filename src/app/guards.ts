import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Page only for logged-in users. If roles are given, only those roles can open it. */
export function roleGuard(...roles: string[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }
    if (roles.length > 0 && !roles.includes(auth.role() ?? '')) {
      return router.createUrlTree([auth.homePath()]);
    }
    return true;
  };
}

/** Login and Register pages: a logged-in user is sent to his or her own portal. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? router.createUrlTree([auth.homePath()]) : true;
};
