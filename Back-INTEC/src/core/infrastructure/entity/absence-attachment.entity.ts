import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'absence_attachments' })
export class AbsenceAttachmentEntity {
    @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
    id!: number;

    @Column({ name: 'id_employee', type: 'varchar', length: 255 })
    id_employee!: string;

    // Tipo de registro al que pertenece: Vacaciones | Permiso | Incapacidad
    @Column({ name: 'reference_type', type: 'varchar', length: 50 })
    reference_type!: string;

    // ID del registro específico (absence_requests.id) al que pertenece el archivo
    @Column({ name: 'reference_id', type: 'varchar', length: 255 })
    reference_id!: string;

    @Column({ name: 'file_url', type: 'text' })
    file_url!: string;

    @Column({ name: 'file_name', type: 'varchar', length: 255 })
    file_name!: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;
}
