import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { LoanPaymentEntity } from './loan_payment.entity';

@Entity({ name: 'loan_requests' })
export class LoanRequestEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'id_loan', type: 'varchar', length: 255 })
  id_loan!: string;

  @Column({ name: 'id_employee', type: 'varchar', length: 255 })
  id_employee!: string;

  @Column({ name: 'operative_owner', type: 'varchar', length: 255 })
  operative_owner!: string;

  @Column({ name: 'executive_owner', type: 'varchar', length: 255 })
  executive_owner!: string;

  @Column({ name: 'approval_date', type: 'varchar', length: 50 })
  approval_date!: string;

  @Column({ name: 'effective_date', type: 'varchar', length: 50 })
  effective_date!: string;

  @Column({ name: 'employee_name', type: 'varchar', length: 255 })
  employee_name!: string;

  @Column({ name: 'position', type: 'varchar', length: 255 })
  position!: string;

  @Column({ name: 'hire_date', type: 'varchar', length: 50 })
  hire_date!: string;

  @Column({ name: 'requested_amount', type: 'decimal', precision: 12, scale: 2 })
  requested_amount!: number;

  @Column({ name: 'authorized_amount', type: 'decimal', precision: 12, scale: 2 })
  authorized_amount!: number;

  @Column({ name: 'loan_reason', type: 'varchar', length: 500 })
  loan_reason!: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50 })
  payment_method!: string;

  @Column({ name: 'payment_count', type: 'int' })
  payment_count!: number;

  @Column({ name: 'first_payment_date', type: 'varchar', length: 50 })
  first_payment_date!: string;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @OneToMany(() => LoanPaymentEntity, (payment) => payment.loan_request)
  payments!: LoanPaymentEntity[];
}
