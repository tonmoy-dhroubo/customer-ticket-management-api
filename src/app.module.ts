import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AIModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CommentsModule } from './comments/comments.module';
import { CommonModule } from './common/common.module';
import { Category } from './database/entities/category.entity';
import { Customer } from './database/entities/customer.entity';
import { Role } from './database/entities/role.entity';
import { TicketComment } from './database/entities/ticket-comment.entity';
import { Ticket } from './database/entities/ticket.entity';
import { User } from './database/entities/user.entity';
import { CustomersModule } from './customers/customers.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { RolesModule } from './roles/roles.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const synchronize = configService.get<string>('DB_SYNC', 'false') === 'true';

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            autoLoadEntities: true,
            entities: [Role, User, Customer, Category, Ticket, TicketComment],
            synchronize,
          };
        }

        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_NAME', 'ticket_db'),
          autoLoadEntities: true,
          entities: [Role, User, Customer, Category, Ticket, TicketComment],
          synchronize,
        };
      },
    }),
    AIModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CustomersModule,
    CustomerAuthModule,
    CategoriesModule,
    TicketsModule,
    CommentsModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
