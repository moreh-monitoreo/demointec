import { Query, Id } from "../../domain/repository/employee-project.repository";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { EmployeeProjectRepository } from "../../domain/repository/employee-project.repository";
import { EmployeeEntity } from "../entity/employees.entity";

export class EmployeeProjectAdapterRepository implements EmployeeProjectRepository<EmployeeEntity> {

  async list(query?: Query): Promise<EmployeeEntity[]> {
    const repository = database.getRepository(EmployeeEntity);
    return repository.find({
      select: ['id_employee', 'name_employee', 'email','project', 'status'],
      where: { is_dev: false },
    });
  }

  async get(id: Id, query?: Query): Promise<EmployeeEntity> {
    const repository = database.getRepository(EmployeeEntity);
    const data = await repository.findOne({
      where: { id_employee: id as string },
      select: ['id_employee', 'name_employee', 'email','project', 'status'],
    });
    if (!data) {
      throw new NotFound("No existe el colaborador con el id proporcionado");
    }
    return data;
  }

  async update(id: Id, data: Partial<EmployeeEntity>, query?: Query): Promise<EmployeeEntity> {
    const repository = database.getRepository(EmployeeEntity);
    const existing = await repository.findOne({ where: { id_employee: id as string } });
    if (!existing) {
      throw new NotFound("No existe el colaborador con el id proporcionado");
    }
    await repository.update(id, { project: data.project });

    await this.updateProjectOnRTDB(id.toString(), data.project || '');

    return this.get(id);
  }

  async remove(id: Id, query?: Query): Promise<EmployeeEntity> {
    const repository = database.getRepository(EmployeeEntity);
    const data = await this.get(id);
    await repository.update({ id_employee: id.toString() }, { project: '' });

    await this.updateProjectOnRTDB(id.toString(), '');

    return data;
  }

  private async updateProjectOnRTDB(id: string, project: string): Promise<void> {
    try {
      const admin = require('firebase-admin');
      const db = admin.database();
      const ref = db.ref('Perfiles/' + id);

      const snapshot = await ref.once('value');
      if (!snapshot.exists()) {
        return;
      }

      await ref.update({ project: project });
    } catch (error) {
      console.error('Error al sincronizar project en Firebase RTDB:', error);
    }
  }
}
