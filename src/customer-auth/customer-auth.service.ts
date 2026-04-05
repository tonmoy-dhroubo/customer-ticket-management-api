import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomersService } from '../customers/customers.service';
import { Customer } from '../database/entities/customer.entity';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerRegisterDto } from './dto/customer-register.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CustomerRegisterDto) {
    const existing = await this.customerRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Customer with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const customer = this.customerRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      passwordHash,
    });

    const saved = await this.customerRepository.save(customer);
    return this.customersService.sanitizeCustomer(saved);
  }

  async login(dto: CustomerLoginDto) {
    const customer = await this.customersService.findByEmailIncludingPassword(dto.email);
    if (!customer || !customer.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const matches = await bcrypt.compare(dto.password, customer.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = await this.jwtService.signAsync({
      sub: customer.id,
      email: customer.email,
      role: 'Customer',
      userType: 'CUSTOMER',
    });

    return {
      accessToken: token,
      customer: this.customersService.sanitizeCustomer(customer),
    };
  }

  async me(customerId: number) {
    const customer = await this.customersService.findRawById(customerId);
    if (!customer) {
      throw new UnauthorizedException('Customer not found.');
    }

    return this.customersService.sanitizeCustomer(customer);
  }
}
