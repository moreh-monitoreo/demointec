import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: 'training_instruction_folders' })
export class TrainingInstructionFolderEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'folder_name', type: 'varchar', length: 255 })
    folder_name!: string;

    @Column({ name: 'folder_path', type: 'varchar', length: 500 })
    folder_path!: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;
}
