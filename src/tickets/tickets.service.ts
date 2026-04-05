import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIService } from '../ai/ai.service';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../database/entities/category.entity';
import { Customer } from '../database/entities/customer.entity';
import { Ticket } from '../database/entities/ticket.entity';
import { User } from '../database/entities/user.entity';
import { TicketStatus } from '../database/enums/ticket-status.enum';
import { RolesService } from '../roles/roles.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

interface CreateCustomerTicketInput {
  title: string;
  description: string;
}

interface ClassificationPreviewInput {
  title: string;
  description: string;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly aiService: AIService,
    private readonly categoriesService: CategoriesService,
    private readonly rolesService: RolesService,
  ) {}

  async create(dto: CreateTicketDto) {
    const creator = await this.userRepository.findOne({ where: { id: dto.createdBy } });
    if (!creator) {
      throw new NotFoundException('Creator user not found.');
    }

    let customer: Customer | null = null;
    if (dto.customerId) {
      customer = await this.customerRepository.findOne({ where: { id: dto.customerId } });
      if (!customer) {
        throw new NotFoundException('Customer not found.');
      }
    }

    const combinedText = `${dto.title} ${dto.description}`;
    const aiClassification = await this.aiService.classifyTicket(combinedText);
    const summary = await this.aiService.summarizeTicket(dto.description);
    const assignmentRole = this.aiService.suggestAssignment(aiClassification.category);

    let category = await this.categoriesService.findByName(aiClassification.category);
    if (!category) {
      category = await this.categoryRepository.save(this.categoryRepository.create({ name: 'Support' }));
    }

    const role = await this.rolesService.findByName(assignmentRole);
    const assignee = role
      ? await this.userRepository.findOne({ where: { roleId: role.id }, order: { createdAt: 'ASC' } })
      : null;

    const ticket = this.ticketRepository.create({
      title: dto.title,
      description: dto.description,
      status: TicketStatus.OPEN,
      priority: aiClassification.priority,
      categoryId: category.id,
      createdBy: creator.id,
      assignedTo: assignee?.id ?? null,
      customerId: customer?.id ?? null,
      aiConfidence: aiClassification.confidence,
      aiSource: aiClassification.source,
      summary,
    });

    const saved = await this.ticketRepository.save(ticket);
    return this.findOne(saved.id);
  }

  async classifyPreview(payload: ClassificationPreviewInput) {
    const combinedText = `${payload.title} ${payload.description}`;
    const aiClassification = await this.aiService.classifyTicket(combinedText);
    const summary = await this.aiService.summarizeTicket(payload.description);
    const assignmentRole = this.aiService.suggestAssignment(aiClassification.category);

    let category = await this.categoriesService.findByName(aiClassification.category);
    if (!category) {
      category = await this.categoryRepository.save(this.categoryRepository.create({ name: 'Support' }));
    }

    const role = await this.rolesService.findByName(assignmentRole);
    const assignee = role
      ? await this.userRepository.findOne({ where: { roleId: role.id }, order: { createdAt: 'ASC' } })
      : null;

    return {
      categoryId: category.id,
      categoryName: category.name,
      priority: aiClassification.priority,
      confidence: aiClassification.confidence,
      source: aiClassification.source,
      summary,
      assignmentRole,
      suggestedAssigneeId: assignee?.id ?? null,
      suggestedAssigneeName: assignee?.name ?? null,
    };
  }

  async createForCustomer(customerId: number, payload: CreateCustomerTicketInput) {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    const createdBy = await this.findFallbackCreatorUserId();
    const combinedText = `${payload.title} ${payload.description}`;
    const aiClassification = await this.aiService.classifyTicket(combinedText);
    const summary = await this.aiService.summarizeTicket(payload.description);
    const assignmentRole = this.aiService.suggestAssignment(aiClassification.category);

    let category = await this.categoriesService.findByName(aiClassification.category);
    if (!category) {
      category = await this.categoryRepository.save(this.categoryRepository.create({ name: 'Support' }));
    }

    const role = await this.rolesService.findByName(assignmentRole);
    const assignee = role
      ? await this.userRepository.findOne({ where: { roleId: role.id }, order: { createdAt: 'ASC' } })
      : null;

    const ticket = this.ticketRepository.create({
      title: payload.title,
      description: payload.description,
      status: TicketStatus.OPEN,
      priority: aiClassification.priority,
      categoryId: category.id,
      createdBy,
      assignedTo: assignee?.id ?? null,
      customerId: customer.id,
      aiConfidence: aiClassification.confidence,
      aiSource: aiClassification.source,
      summary,
    });

    const saved = await this.ticketRepository.save(ticket);
    return this.findOne(saved.id);
  }

  async findAll() {
    const tickets = await this.ticketRepository.find({
      relations: ['category', 'creator', 'assignee', 'customer'],
      order: { createdAt: 'DESC' },
    });

    return tickets.map((ticket) => this.sanitizeTicket(ticket));
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['category', 'creator', 'assignee', 'customer', 'comments', 'comments.user'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    return this.sanitizeTicket(ticket);
  }

  async findForCustomer(customerId: number) {
    const tickets = await this.ticketRepository.find({
      where: { customerId },
      relations: ['category', 'creator', 'assignee', 'customer'],
      order: { createdAt: 'DESC' },
    });

    return tickets.map((ticket) => this.sanitizeTicket(ticket));
  }

  async update(id: number, dto: UpdateTicketDto) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found.');
    }

    if (dto.assignedTo !== undefined) {
      const assignee = await this.userRepository.findOne({ where: { id: dto.assignedTo } });
      if (!assignee) {
        throw new NotFoundException('Assignee not found.');
      }
      ticket.assignedTo = assignee.id;
    }

    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException('Category not found.');
      }
      ticket.categoryId = category.id;
    }

    if (dto.status !== undefined) {
      ticket.status = dto.status;
    }

    if (dto.priority !== undefined) {
      ticket.priority = dto.priority;
    }

    if (dto.summary !== undefined) {
      ticket.summary = dto.summary;
    }

    await this.ticketRepository.save(ticket);
    return this.findOne(id);
  }

  private sanitizeTicket(ticket: Ticket) {
    const creator = ticket.creator
      ? {
          id: ticket.creator.id,
          name: ticket.creator.name,
          email: ticket.creator.email,
          roleId: ticket.creator.roleId,
        }
      : null;

    const assignee = ticket.assignee
      ? {
          id: ticket.assignee.id,
          name: ticket.assignee.name,
          email: ticket.assignee.email,
          roleId: ticket.assignee.roleId,
        }
      : null;

    const comments = ticket.comments?.map((comment) => ({
      ...comment,
      user: comment.user
        ? {
            id: comment.user.id,
            name: comment.user.name,
            email: comment.user.email,
            roleId: comment.user.roleId,
          }
        : null,
    }));

    return {
      ...ticket,
      creator,
      assignee,
      comments,
    };
  }

  private async findFallbackCreatorUserId(): Promise<number> {
    const adminRole = await this.rolesService.findByName('Admin');
    if (adminRole) {
      const adminUser = await this.userRepository.findOne({
        where: { roleId: adminRole.id },
        order: { createdAt: 'ASC' },
      });
      if (adminUser) {
        return adminUser.id;
      }
    }

    const anyUser = await this.userRepository.findOne({ order: { createdAt: 'ASC' } });
    if (!anyUser) {
      throw new NotFoundException('No internal users found to create customer ticket.');
    }

    return anyUser.id;
  }
}
