import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionsService } from '../services/permissions.service';

export const permissionsGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  // Si no hay permisos configurados para el rol → acceso libre
  if (!permissionsService.hasPermissionsConfigured()) return true;

  const fullRoute = '/dashboard/' + route.url.map(s => s.path).join('/');
  const canAccess = permissionsService.canAccessRoute(fullRoute);

  if (!canAccess) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
