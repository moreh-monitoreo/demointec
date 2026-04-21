import database from "../../../config/db";
import { ModuleEntity } from "../entity/module.entity";
import { SectionEntity } from "../entity/section.entity";
import { ModulePermissionEntity } from "../entity/module-permission.entity";
import { RolePermissionsRepository } from "../../domain/repository/role-permissions.repository";

export class RolePermissionsAdapterRepository implements RolePermissionsRepository {

  async getModules(): Promise<ModuleEntity[]> {
    const repo = database.getRepository(ModuleEntity);
    return repo.find({ where: { status: true }, order: { sort_order: 'ASC' } });
  }

  async getSections(): Promise<SectionEntity[]> {
    const repo = database.getRepository(SectionEntity);
    return repo.find({ where: { status: true }, order: { sort_order: 'ASC' } });
  }

  async getPermissionsByRole(roleId: string | number): Promise<ModulePermissionEntity[]> {
    const repo = database.getRepository(ModulePermissionEntity);
    return repo.createQueryBuilder('mp')
      .leftJoinAndSelect('mp.module', 'module')
      .leftJoinAndSelect('mp.section', 'section')
      .where('mp.role_id = :roleId', { roleId: Number(roleId) })
      .getMany();
  }

  async savePermissions(roleId: string | number, permissions: { module_id: number; section_id?: number; can_access: boolean }[]): Promise<void> {
    const repo = database.getRepository(ModulePermissionEntity);
    await repo.createQueryBuilder()
      .delete()
      .from(ModulePermissionEntity)
      .where('role_id = :roleId', { roleId: Number(roleId) })
      .execute();

    const entities = permissions.map(p => {
      const entity = repo.create({
        role_id: Number(roleId),
        module_id: p.module_id,
        section_id: p.section_id ?? undefined,
        can_access: p.can_access,
      });
      return entity;
    });

    await repo.save(entities);
  }
}
