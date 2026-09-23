import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AiConversationEntity } from './ai-conversation.entity';

@Entity({ name: 'ai_messages' })
export class AiMessageEntity {
    @PrimaryGeneratedColumn({ name: 'id' })
    id!: number;

    @Column({ name: 'id_conversation', type: 'int' })
    id_conversation!: number;

    @Column({ name: 'role', type: 'varchar', length: 20 })
    role!: string;

    @Column({ name: 'content', type: 'longtext' })
    content!: string;

    @Column({ name: 'chart_json', type: 'longtext', nullable: true })
    chart_json!: string | null;

    @Column({ name: 'queries_used', type: 'text', nullable: true })
    queries_used!: string | null;

    @CreateDateColumn({ name: 'created_at' })
    created_at!: Date;

    @ManyToOne(() => AiConversationEntity)
    @JoinColumn({ name: 'id_conversation' })
    conversation!: AiConversationEntity;
}
