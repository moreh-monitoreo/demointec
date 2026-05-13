import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EmployeeEntity } from './employees.entity';

@Entity({ name: 'terminations' })
export class TerminationEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'id_employee', type: 'varchar', length: 255 })
    id_employee!: string;

    @Column({ name: 'last_work_day', type: 'date' })
    last_work_day!: string;

    @Column({ name: 'reason', type: 'varchar', length: 255 })
    reason!: string;

    @Column({ name: 'severance_date', type: 'date', nullable: true })
    severance_date!: string;

    @Column({ name: 'observation', type: 'text', nullable: true })
    observation!: string;

    @Column({ name: 'labor_event_id', type: 'int', nullable: true })
    labor_event_id!: number;

    @Column({ name: 'document_path', type: 'text', nullable: true })
    document_path!: string;

    @Column({ name: 'document_name', type: 'varchar', length: 255, nullable: true })
    document_name!: string;

    @Column({ name: 'document_paths', type: 'json', nullable: true })
    document_paths!: string[];

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @ManyToOne(() => EmployeeEntity)
    @JoinColumn({ name: 'id_employee' })
    employee!: EmployeeEntity;
}
