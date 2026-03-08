import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'categories_inventory' })
export class InventoryCategoryEntity {
  @PrimaryGeneratedColumn()
  id_category_inventory!: number;

  @Column({ name: 'name_category', type: 'varchar', length: 100 })
  name_category!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;
}
