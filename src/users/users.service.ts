import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existing) {
      throw new ConflictException('User with this email already exists.');
    }

    const role = createUserDto.roleId
      ? await this.roleRepository.findOne({ where: { id: createUserDto.roleId } })
      : await this.roleRepository.findOne({ where: { name: 'Support Team' } });

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      passwordHash,
      roleId: role.id,
    });

    return this.userRepository.save(user);
  }

  async createPublic(createUserDto: CreateUserDto) {
    const user = await this.create(createUserDto);
    return this.sanitizeUser(user);
  }

  async findAll() {
    const users = await this.userRepository.find({ relations: ['role'], order: { id: 'ASC' } });
    return users.map((user) => this.sanitizeUser(user));
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email }, relations: ['role'] });
  }

  findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['role'] });
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
      createdAt: user.createdAt,
    };
  }

  async seedDefaultAdmin(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ticket.local';
    const existing = await this.userRepository.findOne({ where: { email: adminEmail } });
    if (existing) {
      return;
    }

    const adminRole = await this.roleRepository.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123456';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const admin = this.userRepository.create({
      name: process.env.ADMIN_NAME ?? 'System Admin',
      email: adminEmail,
      passwordHash,
      roleId: adminRole.id,
    });

    await this.userRepository.save(admin);
  }
}
