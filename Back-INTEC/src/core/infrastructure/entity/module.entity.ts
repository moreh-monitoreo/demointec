import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ModulePermissionEntity } from './module-permission.entity';
import { SectionEntity } from './section.entity';

@Entity({ name: 'modules' })
export class ModuleEntity {
  @PrimaryGeneratedColumn({ name: 'id_module', type: 'int' })
  id_module!: number;

  @Column({ name: 'name_module', type: 'varchar', length: 100 })
  name_module!: string;

  @Column({ name: 'icon_module', type: 'varchar', length: 100, nullable: true })
  icon_module?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @OneToMany(() => ModulePermissionEntity, mp => mp.module)
  permissions!: ModulePermissionEntity[];

  @OneToMany(() => SectionEntity, s => s.moduleEntity)
  sections!: SectionEntity[];
}
