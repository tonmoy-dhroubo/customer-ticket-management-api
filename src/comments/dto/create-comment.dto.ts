import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsInt()
  ticketId!: number;

  @IsInt()
  userId!: number;

  @IsString()
  @MinLength(1)
  comment!: string;
}
