import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'vacation_adjustments' })
export class VacationAdjustmentEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    id!: number;

    @Column({ name: 'id_employee', type: 'varchar', length: 255 })
    id_employee!: string;

    @Column({ name: 'year', type: 'int' })
    year!: number;

    @Column({ name: 'base_days', type: 'int' })
    base_days!: number;
}
