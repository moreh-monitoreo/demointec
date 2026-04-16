export interface SessionSectionPermission {
  id_section: number;
  name_section: string;
  route_section: string;
  can_access: boolean;
}

export interface SessionModulePermission {
  id_module: number;
  name_module: string;
  can_access: boolean;
  sections: SessionSectionPermission[];
}
