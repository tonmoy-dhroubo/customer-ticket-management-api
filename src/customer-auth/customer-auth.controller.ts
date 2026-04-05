import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CustomerJwtAuthGuard } from '../common/guards/customer-jwt-auth.guard';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('register')
  register(@Body() dto: CustomerRegisterDto) {
    return this.customerAuthService.register(dto);
  }

  @Post('login')
  login(@Body() dto: CustomerLoginDto) {
    return this.customerAuthService.login(dto);
  }

  @UseGuards(CustomerJwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: { sub: number } }) {
    return this.customerAuthService.me(req.user.sub);
  }
}
