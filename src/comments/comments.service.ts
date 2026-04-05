import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketComment } from '../database/entities/ticket-comment.entity';
import { Ticket } from '../database/entities/ticket.entity';
import { User } from '../database/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(TicketComment)
    private readonly commentRepository: Repository<TicketComment>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateCommentDto) {
    const ticket = await this.ticketRepository.findOne({ where: { id: dto.ticketId } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    const user = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const comment = this.commentRepository.create({
      ticketId: ticket.id,
      userId: user.id,
      comment: dto.comment,
    });

    await this.commentRepository.save(comment);
    const saved = await this.commentRepository.findOne({
      where: { id: comment.id },
      relations: ['user'],
    });

    if (!saved) {
      throw new NotFoundException('Comment not found after creation.');
    }

    return this.sanitizeComment(saved);
  }

  async findByTicket(ticketId: number) {
    const comments = await this.commentRepository.find({
      where: { ticketId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return comments.map((comment) => this.sanitizeComment(comment));
  }

  private sanitizeComment(comment: TicketComment) {
    return {
      ...comment,
      user: comment.user
        ? {
            id: comment.user.id,
            name: comment.user.name,
            email: comment.user.email,
            roleId: comment.user.roleId,
          }
        : null,
    };
  }
}
