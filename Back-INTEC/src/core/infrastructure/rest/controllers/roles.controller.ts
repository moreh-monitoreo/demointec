import { Request, Response } from "express";
import { config } from 'dotenv';
import { RoleRepository } from "../../../domain/repository/roles.repository";
import { RoleEntity } from "../../entity/roles.entity";


config();

export class RoleController {
  constructor(private roleRepository: RoleRepository<RoleEntity>) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      const role = await this.roleRepository.create(body);
      res.status(200).json({ message: 'Agregado correctamente', role });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el rol', error });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const roles = await this.roleRepository.list();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar los roles', error });
    }
  }

  async get(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await this.roleRepository.get(id);
      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el rol', error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body;
      const role = await this.roleRepository.update(Number(id), body);
      res.status(200).json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el rol', error });
      console.error(error)
      
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await this.roleRepository.remove(Number(id));
      res.status(200).json({ message: 'Eliminado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
  }


}