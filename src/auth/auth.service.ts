import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const user = await this.usersService.create(dto);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role?.name ?? 'Support Team',
    });

    return {
      accessToken: token,
      user: this.usersService.sanitizeUser(user),
    };
  }

  async me(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.usersService.sanitizeUser(user);
  }
}
