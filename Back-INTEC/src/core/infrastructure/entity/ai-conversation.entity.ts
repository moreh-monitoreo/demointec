import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './users.entity';

@Entity({ name: 'ai_conversations' })
export class AiConversationEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id!: number;

    @Column({ name: 'id_user', type: 'int' })
    id_user!: number;

    @Column({ name: 'title', type: 'varchar', length: 255 })
    title!: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at!: Date;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: 'id_user' })
    user!: UserEntity;
}
