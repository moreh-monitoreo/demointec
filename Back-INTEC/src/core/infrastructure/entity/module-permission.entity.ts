import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RoleEntity } from './roles.entity';
import { ModuleEntity } from './module.entity';
import { SectionEntity } from './section.entity';

@Entity({ name: 'module_permissions' })
export class ModulePermissionEntity {
  @PrimaryGeneratedColumn({ name: 'id_permission', type: 'int' })
  id_permission!: number;

  @ManyToOne(() => RoleEntity)
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @Column({ name: 'role_id', type: 'int' })
  role_id!: number;

  @ManyToOne(() => ModuleEntity, module => module.permissions)
  @JoinColumn({ name: 'module_id' })
  module!: ModuleEntity;

  @Column({ name: 'module_id', type: 'int' })
  module_id!: number;

  @ManyToOne(() => SectionEntity, section => section.permissions, { nullable: true })
  @JoinColumn({ name: 'section_id' })
  section?: SectionEntity;

  @Column({ name: 'section_id', type: 'int', nullable: true })
  section_id?: number;

  @Column({ name: 'can_access', type: 'boolean', default: false })
  can_access!: boolean;
}
