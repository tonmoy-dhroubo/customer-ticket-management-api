import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Ticket } from './ticket.entity';
import { TicketComment } from './ticket-comment.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'role_id' })
  roleId!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @OneToMany(() => Ticket, (ticket) => ticket.creator)
  createdTickets!: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.assignee)
  assignedTickets!: Ticket[];

  @OneToMany(() => TicketComment, (comment) => comment.user)
  comments!: TicketComment[];
}
