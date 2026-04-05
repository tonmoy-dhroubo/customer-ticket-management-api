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

  create(payload: Pick<Customer, 'name' | 'email' | 'phone'>): Promise<Customer> {
    const customer = this.customerRepository.create(payload);
    return this.customerRepository.save(customer);
  }

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ order: { id: 'DESC' } });
  }

  async findById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return customer;
  }
}
