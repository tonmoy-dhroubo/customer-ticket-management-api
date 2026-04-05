import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(payload: Pick<Customer, 'name' | 'email' | 'phone'>) {
    const customer = this.customerRepository.create(payload);
    const saved = await this.customerRepository.save(customer);
    return this.sanitizeCustomer(saved);
  }

  async findAll() {
    const customers = await this.customerRepository.find({ order: { id: 'DESC' } });
    return customers.map((customer) => this.sanitizeCustomer(customer));
  }

  async findById(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return this.sanitizeCustomer(customer);
  }

  async findByEmailIncludingPassword(email: string): Promise<Customer | null> {
    return this.customerRepository
      .createQueryBuilder('customer')
      .addSelect('customer.passwordHash')
      .where('customer.email = :email', { email })
      .getOne();
  }

  async findRawById(id: number): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id } });
  }

  sanitizeCustomer(customer: Customer) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
    };
  }
}
