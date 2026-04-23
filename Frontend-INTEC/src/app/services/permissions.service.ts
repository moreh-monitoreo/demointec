import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SessionModulePermission } from '../models/session-permissions';

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private platformId = inject(PLATFORM_ID);

  private get permissions(): SessionModulePermission[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.permissions || [];
    } catch {
      return [];
    }
  }

  /** ¿El rol tiene configurados permisos? (array no vacío) */
  hasPermissionsConfigured(): boolean {
    return this.permissions.length > 0;
  }

  /** ¿Puede acceder al módulo? */
  canAccessModule(moduleName: string): boolean {
    const perms = this.permissions;
    if (perms.length === 0) return true; // sin permisos configurados → acceso libre
    const mod = perms.find(m => m.name_module === moduleName);
    return mod ? mod.can_access : false;
  }

  /** ¿Puede acceder a una ruta/apartado específico? */
  canAccessRoute(route: string): boolean {
    const perms = this.permissions;
    if (perms.length === 0) return true;
    for (const mod of perms) {
      if (!mod.can_access) continue;
      const sec = mod.sections.find(s => s.route_section === route);
      if (sec) return sec.can_access;
    }
    return false;
  }

  /** Obtiene todos los módulos con acceso */
  getAccessibleModules(): SessionModulePermission[] {
    const perms = this.permissions;
    if (perms.length === 0) return [];
    return perms.filter(m => m.can_access);
  }

  /** Obtiene secciones accesibles de un módulo */
  getAccessibleSections(moduleName: string): string[] {
    const perms = this.permissions;
    if (perms.length === 0) return [];
    const mod = perms.find(m => m.name_module === moduleName);
    if (!mod || !mod.can_access) return [];
    return mod.sections.filter(s => s.can_access).map(s => s.route_section);
  }

  /** Lee un flag de permiso granular (pXxx) directamente del usuario en localStorage */
  getFlag(flag: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user[flag] === '1' || user[flag] === true;
    } catch {
      return false;
    }
  }
}
