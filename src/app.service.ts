import { Injectable, OnModuleInit } from '@nestjs/common';
import { CategoriesService } from './categories/categories.service';
import { RolesService } from './roles/roles.service';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    private readonly rolesService: RolesService,
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rolesService.seedDefaultRoles();
    await this.categoriesService.seedDefaultCategories();
    await this.usersService.seedDefaultAdmin();
  }

  getHealth() {
    return {
      status: 'ok',
      service: 'ticket-backend',
      aiSource: 'MOCK',
    };
  }
}
