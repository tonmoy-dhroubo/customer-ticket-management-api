import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIModule } from '../ai/ai.module';
import { CategoriesModule } from '../categories/categories.module';
import { Category } from '../database/entities/category.entity';
import { Customer } from '../database/entities/customer.entity';
import { Ticket } from '../database/entities/ticket.entity';
import { User } from '../database/entities/user.entity';
import { RolesModule } from '../roles/roles.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, User, Customer, Category]),
    AIModule,
    CategoriesModule,
    RolesModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService, TypeOrmModule],
})
export class TicketsModule {}
