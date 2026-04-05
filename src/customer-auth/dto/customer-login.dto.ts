import { IsEmail, MinLength } from 'class-validator';

export class CustomerLoginDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;
}
