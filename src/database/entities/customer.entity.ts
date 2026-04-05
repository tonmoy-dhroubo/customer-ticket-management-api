import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  phone!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => Ticket, (ticket) => ticket.customer)
  tickets!: Ticket[];
}
