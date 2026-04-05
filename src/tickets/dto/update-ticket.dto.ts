import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TicketPriority } from '../../database/enums/ticket-priority.enum';
import { TicketStatus } from '../../database/enums/ticket-status.enum';

export class UpdateTicketDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  assignedTo?: number;

  @IsOptional()
  @IsString()
  summary?: string;
}
