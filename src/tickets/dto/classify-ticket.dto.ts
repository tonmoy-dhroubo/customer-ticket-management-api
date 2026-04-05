import { IsString, MinLength } from 'class-validator';

export class ClassifyTicketDto {
  @IsString()
  title!: string;

  @IsString()
  @MinLength(8)
  description!: string;
}
