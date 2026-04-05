import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { Category } from './category.entity';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { TicketComment } from './ticket-comment.entity';

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status!: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority!: TicketPriority;

  @Column({ name: 'category_id' })
  categoryId!: number;

  @Column({ name: 'created_by' })
  createdBy!: number;

  @Column({ name: 'assigned_to', type: 'int', nullable: true })
  assignedTo!: number | null;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId!: number | null;

  @Column({ name: 'ai_confidence', type: 'numeric', precision: 5, scale: 2, default: 0 })
  aiConfidence!: number;

  @Column({ name: 'ai_source', default: 'MOCK' })
  aiSource!: string;

  @Column({ type: 'varchar', length: 180, nullable: true })
  summary!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Category, (category) => category.tickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToOne(() => User, (user) => user.createdTickets, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  creator!: User;

  @ManyToOne(() => User, (user) => user.assignedTickets, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to' })
  assignee!: User | null;

  @ManyToOne(() => Customer, (customer) => customer.tickets, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer | null;

  @OneToMany(() => TicketComment, (comment) => comment.ticket)
  comments!: TicketComment[];
}
