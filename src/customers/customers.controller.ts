import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';

class CreateCustomerDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
    });
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findById(id);
  }
}
