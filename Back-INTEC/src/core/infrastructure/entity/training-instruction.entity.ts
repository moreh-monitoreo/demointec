import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'training_instructions' })
export class TrainingInstructionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'document_type', type: 'varchar', length: 50 })
    document_type!: string;

    @Column({ name: 'name_document', type: 'varchar', length: 255 })
    name_document!: string;

    @Column({ name: 'document_path', type: 'text', nullable: true })
    document_path!: string;

    @CreateDateColumn({ name: 'upload_date' })
    upload_date!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at!: Date;
}
