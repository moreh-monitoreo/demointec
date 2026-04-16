export interface Module {
  id_module: number;
  name_module: string;
  icon_module?: string;
  sort_order: number;
  status: boolean;
}

export interface Section {
  id_section: number;
  name_section: string;
  route_section?: string;
  sort_order: number;
  status: boolean;
  module_id: number;
}

export interface ModulePermission {
  id_permission?: number;
  role_id: number;
  module_id: number;
  section_id?: number;
  can_access: boolean;
}

export interface RolePermissionPayload {
  module_id: number;
  section_id?: number;
  can_access: boolean;
}
