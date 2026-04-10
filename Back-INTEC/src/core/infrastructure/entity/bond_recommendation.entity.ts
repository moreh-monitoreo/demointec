import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'bond_recommendations' })
export class BondRecommendationEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'id_bond_rec', type: 'varchar', length: 255 })
  id_bond_rec!: string;

  @Column({ name: 'id_employee', type: 'varchar', length: 255 })
  id_employee!: string;

  @Column({ name: 'employee_name', type: 'varchar', length: 255 })
  employee_name!: string;

  @Column({ name: 'hire_date', type: 'varchar', length: 50 })
  hire_date!: string;

  @Column({ name: 'recommended_person', type: 'varchar', length: 255, default: '' })
  recommended_person!: string;

  @Column({ name: 'contract_date', type: 'varchar', length: 50 })
  contract_date!: string;

  @Column({ name: 'bond_amount', type: 'decimal', precision: 12, scale: 2 })
  bond_amount!: number;

  @Column({ name: 'payment_date', type: 'varchar', length: 50 })
  payment_date!: string;

  @Column({ name: 'observations', type: 'varchar', length: 500, default: '' })
  observations!: string;

  @Column({ name: 'direct_boss_signature', type: 'varchar', length: 255, default: '' })
  direct_boss_signature!: string;

  @Column({ name: 'rh_signature', type: 'varchar', length: 255, default: '' })
  rh_signature!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;
}
