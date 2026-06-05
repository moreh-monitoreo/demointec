import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeEntity } from './employees.entity';

@Entity({ name: 'absence_requests' })
export class AbsenceRequestEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'id_employee', type: 'varchar', length: 255 })
    id_employee!: string;

    @Column({ name: 'type', type: 'varchar', length: 255 })
    type!: string;

    @Column({ name: 'start_date', type: 'date' })
    start_date!: string;

    @Column({ name: 'end_date', type: 'date' })
    end_date!: string;

    @Column({ name: 'days_count', type: 'int' })
    days_count!: number;

    @Column({ name: 'reason', type: 'varchar', length: 100 })
    reason!: string;

    @Column({ name: 'description', type: 'text', nullable: true })
    description!: string;

    @Column({ name: 'with_pay', type: 'boolean', default: false })
    with_pay!: boolean;

    @Column({ name: 'vacation_year', type: 'int', nullable: true })
    vacation_year!: number;

    @Column({ name: 'document_url', type: 'text', nullable: true })
    document_url!: string;

    @Column({ name: 'request_date', type: 'date' })
    request_date!: string;

    @Column({ name: 'return_to_work_date', type: 'date', nullable: true })
    return_to_work_date!: string;

    @ManyToOne(() => EmployeeEntity)
    @JoinColumn({ name: 'id_employee' })
    employee!: EmployeeEntity;
}
