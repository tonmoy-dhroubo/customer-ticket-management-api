import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../database/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = ['Admin', 'Finance Agent', 'Tech Support', 'Product Team', 'Support Team'];

    for (const roleName of defaultRoles) {
      const existing = await this.roleRepository.findOne({ where: { name: roleName } });
      if (!existing) {
        await this.roleRepository.save(this.roleRepository.create({ name: roleName }));
      }
    }
  }

  findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { name } });
  }

  findAll(): Promise<Role[]> {
    return this.roleRepository.find({ order: { id: 'ASC' } });
  }
}
