import { Query, UserRepository, Id } from "../../domain/repository/users.repository";
import { UserEntity } from "../entity/users.entity";
import database from "../../../config/db";
import { NotFound } from "http-errors";
import { RoleEntity } from "../entity/roles.entity";
import * as bcrypt from 'bcrypt';
import { RoleRepository } from "../../domain/repository/roles.repository";



export class RoleAdapterRepository implements RoleRepository<RoleEntity> {
  
    async create(data: Partial<RoleEntity>, query?: Query): Promise<RoleEntity> {
    const roleRepository = database.getRepository(RoleEntity);

    const role = roleRepository.create({
      ...data,
    });
    const saved = await roleRepository.save(role);
    return roleRepository.findOneOrFail({
      where: { id_role: saved.id_role },
    });
    }
  
    async list(query?: Query): Promise<RoleEntity[]> {
      const repository = database.getRepository(RoleEntity);
      return repository.find({
      });
    }
  
    async get(id: Id, query?: Query): Promise<RoleEntity> {
      const repository = database.getRepository(RoleEntity);
      const role = await repository.findOne({
        where: { id_role: id as number },
      });
      if (!role) {
        throw new NotFound("No existe el rol con el id proporcionado");
      }
      return role;
    }
  
    async update(id: Id, data: Partial<RoleEntity>, query?: Query): Promise<RoleEntity> {
      const roleRepository = database.getRepository(RoleEntity);
      await roleRepository.update(id, data);
      return this.get(id);
    }
    
    async remove(id: Id, query?: Query): Promise<RoleEntity> {
      const roleRepository = database.getRepository(RoleEntity);
      
      const role = await this.get(id, query);
      await roleRepository.update({ id_role: Number(id) }, { status: false });
      return role;
    }
  }