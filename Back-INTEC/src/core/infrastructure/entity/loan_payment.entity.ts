import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LoanRequestEntity } from './loan_request.entity';

@Entity({ name: 'loan_payments' })
export class LoanPaymentEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id!: number;

  @Column({ name: 'id_payment', type: 'varchar', length: 255 })
  id_payment!: string;

  @Column({ name: 'id_loan', type: 'varchar', length: 255 })
  id_loan!: string;

  @Column({ name: 'payment_date', type: 'varchar', length: 50 })
  payment_date!: string;

  @Column({ name: 'payment_amount', type: 'decimal', precision: 12, scale: 2 })
  payment_amount!: number;

  @Column({ name: 'paid', type: 'boolean', default: false })
  paid!: boolean;

  @Column({ name: 'status', type: 'boolean', default: true })
  status!: boolean;

  @ManyToOne(() => LoanRequestEntity, (loan) => loan.payments)
  @JoinColumn({ name: 'id_loan', referencedColumnName: 'id_loan' })
  loan_request!: LoanRequestEntity;
}
