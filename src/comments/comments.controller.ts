import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() dto: CreateCommentDto) {
    return this.commentsService.create(dto);
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId', ParseIntPipe) ticketId: number) {
    return this.commentsService.findByTicket(ticketId);
  }
}
