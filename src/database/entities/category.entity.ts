import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Ticket, (ticket) => ticket.category)
  tickets!: Ticket[];
}
