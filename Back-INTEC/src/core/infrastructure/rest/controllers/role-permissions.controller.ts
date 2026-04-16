import { Request, Response } from "express";
import { RolePermissionsRepository } from "../../../domain/repository/role-permissions.repository";

export class RolePermissionsController {
  constructor(private repository: RolePermissionsRepository) {}

  async getModules(req: Request, res: Response): Promise<void> {
    try {
      const modules = await this.repository.getModules();
      res.status(200).json(modules);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener módulos', error });
    }
  }

  async getSections(req: Request, res: Response): Promise<void> {
    try {
      const sections = await this.repository.getSections();
      res.status(200).json(sections);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener apartados', error });
    }
  }

  async getPermissionsByRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const permissions = await this.repository.getPermissionsByRole(roleId);
      res.status(200).json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener permisos del rol', error });
    }
  }

  async savePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const { permissions } = req.body;
      await this.repository.savePermissions(roleId, permissions);
      res.status(200).json({ message: 'Permisos guardados correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al guardar permisos', error });
    }
  }
}
