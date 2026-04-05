import { IsString, MinLength } from 'class-validator';

export class CreateCustomerTicketDto {
  @IsString()
  title!: string;

  @IsString()
  @MinLength(8)
  description!: string;
}
