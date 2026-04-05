import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesService } from './categories/categories.service';
import { RolesService } from './roles/roles.service';
import { UsersService } from './users/users.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RolesService,
          useValue: { seedDefaultRoles: jest.fn() },
        },
        {
          provide: CategoriesService,
          useValue: { seedDefaultCategories: jest.fn() },
        },
        {
          provide: UsersService,
          useValue: { seedDefaultAdmin: jest.fn() },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health payload', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
        service: 'ticket-backend',
        aiSource: 'MOCK',
      });
    });
  });
});
