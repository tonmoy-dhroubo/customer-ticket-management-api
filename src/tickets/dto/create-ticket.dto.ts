import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  title!: string;

  @IsString()
  @MinLength(8)
  description!: string;

  @IsInt()
  createdBy!: number;

  @IsOptional()
  @IsInt()
  customerId?: number;
}
