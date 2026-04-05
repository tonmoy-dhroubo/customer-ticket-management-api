import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CustomerJwtAuthGuard } from '../common/guards/customer-jwt-auth.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClassifyTicketDto } from './dto/classify-ticket.dto';
import { CreateCustomerTicketDto } from './dto/create-customer-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('classify')
  classify(@Body() dto: ClassifyTicketDto) {
    return this.ticketsService.classifyPreview(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.ticketsService.findAll();
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Get('customer/me')
  findMine(@Req() req: Request & { user: { sub: number } }) {
    return this.ticketsService.findForCustomer(req.user.sub);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Post('customer/me')
  createMine(
    @Req() req: Request & { user: { sub: number } },
    @Body() dto: CreateCustomerTicketDto,
  ) {
    return this.ticketsService.createForCustomer(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }
}
