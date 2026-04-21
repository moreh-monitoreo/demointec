import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ModuleEntity } from './module.entity';
import { ModulePermissionEntity } from './module-permission.entity';

@Entity({ name: 'sections' })
export class SectionEntity {
  @PrimaryGeneratedColumn({ name: 'id_section', type: 'int' })
  id_section!: number;

  @Column({ name: 'name_section', type: 'varchar', length: 150 })
  name_section!: string;

  @Column({ name: 'route_section', type: 'varchar', length: 200, nullable: true })
  route_section?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order!: number;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @ManyToOne(() => ModuleEntity, module => module.sections)
  @JoinColumn({ name: 'module_id' })
  moduleEntity!: ModuleEntity;

  @Column({ name: 'module_id', type: 'int' })
  module_id!: number;

  @OneToMany(() => ModulePermissionEntity, mp => mp.section)
  permissions!: ModulePermissionEntity[];
}
