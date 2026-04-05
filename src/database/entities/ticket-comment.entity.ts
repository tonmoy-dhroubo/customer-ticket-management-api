import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from './user.entity';

@Entity({ name: 'ticket_comments' })
export class TicketComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'ticket_id' })
  ticketId!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ type: 'text' })
  comment!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Ticket, (ticket) => ticket.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket!: Ticket;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
