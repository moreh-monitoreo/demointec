export type Query = Record<string, any>;
export type Id = string | number;

export interface RolePermissionsRepository {
  getModules(): Promise<any[]>;
  getSections(): Promise<any[]>;
  getPermissionsByRole(roleId: Id): Promise<any[]>;
  savePermissions(roleId: Id, permissions: any[]): Promise<void>;
}
