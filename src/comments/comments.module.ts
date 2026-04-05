import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketComment } from '../database/entities/ticket-comment.entity';
import { Ticket } from '../database/entities/ticket.entity';
import { User } from '../database/entities/user.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketComment, Ticket, User])],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
