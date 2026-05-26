import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'job_descriptions' })
export class JobDescriptionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // I. Información General del Puesto
    @Column({ type: 'varchar', length: 255 })
    job_title!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    department!: string;

    // II. Razón de Ser
    @Column({ type: 'text', nullable: true })
    objective!: string;

    // III. Funciones Claves - Matrices (stored as JSON)
    @Column({ type: 'text', nullable: true })
    activities_matrix!: string;

    @Column({ type: 'text', nullable: true })
    responsibilities_matrix!: string;

    // IV. Relaciones Estratégicas
    @Column({ type: 'text', nullable: true })
    internal_relations!: string;

    @Column({ type: 'text', nullable: true })
    external_relations!: string;

    // V. Estructura Organizacional
    @Column({ type: 'varchar', length: 255, nullable: true })
    org_manager!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    org_supervisor!: string;

    // VI. Características Generales del Perfil
    @Column({ type: 'varchar', length: 100, nullable: true })
    profile_gender!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    profile_age!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    profile_marital_status!: string;

    @Column({ type: 'text', nullable: true })
    profile_schedule!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    profile_travel_availability!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    profile_languages!: string;

    @Column({ type: 'text', nullable: true })
    profile_extra_requirements!: string;

    // VII. Conocimientos y Habilidades
    @Column({ type: 'varchar', length: 255, nullable: true })
    education!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    specialty!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    experience!: string;

    @Column({ type: 'text', nullable: true })
    technical_knowledge!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    software!: string;

    @Column({ type: 'text', nullable: true })
    equipment!: string;

    // VIII. Autorización y Control
    @Column({ type: 'varchar', length: 50, nullable: true })
    created_date!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    created_by!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    reviewed_by!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    authorized_by!: string;

    @Column({ type: 'text', nullable: true })
    change_log!: string;

    @Column({ type: 'boolean', default: true })
    status!: boolean;
}
