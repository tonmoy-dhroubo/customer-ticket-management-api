import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StringValue } from 'ms';
import { CustomersModule } from '../customers/customers.module';
import { Customer } from '../database/entities/customer.entity';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    CustomersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue },
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService],
})
export class CustomerAuthModule {}
