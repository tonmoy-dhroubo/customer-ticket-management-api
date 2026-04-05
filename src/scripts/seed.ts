import 'dotenv/config';
import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { Category } from '../database/entities/category.entity';
import { Customer } from '../database/entities/customer.entity';
import { Role } from '../database/entities/role.entity';
import { TicketComment } from '../database/entities/ticket-comment.entity';
import { Ticket } from '../database/entities/ticket.entity';
import { User } from '../database/entities/user.entity';
import { TicketPriority } from '../database/enums/ticket-priority.enum';
import { TicketStatus } from '../database/enums/ticket-status.enum';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'ticket_db',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  synchronize: true,
  entities: [Role, User, Customer, Category, Ticket, TicketComment],
});

type SeedUser = {
  name: string;
  email: string;
  password: string;
  roleName: string;
};

type SeedCustomer = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

async function main() {
  await dataSource.initialize();

  console.log('Connected to database.');

  await dataSource.query(
    'TRUNCATE TABLE ticket_comments, tickets, users, customers, categories, roles RESTART IDENTITY CASCADE;',
  );

  const roleRepository = dataSource.getRepository(Role);
  const userRepository = dataSource.getRepository(User);
  const customerRepository = dataSource.getRepository(Customer);
  const categoryRepository = dataSource.getRepository(Category);
  const ticketRepository = dataSource.getRepository(Ticket);
  const commentRepository = dataSource.getRepository(TicketComment);

  const roleNames = ['Admin', 'Finance Agent', 'Tech Support', 'Product Team', 'Support Team'];
  const roles = await roleRepository.save(roleNames.map((name) => roleRepository.create({ name })));
  const roleByName = new Map(roles.map((role) => [role.name, role]));

  const usersInput: SeedUser[] = [
    { name: 'System Admin', email: 'admin@ticket.local', password: 'admin123456', roleName: 'Admin' },
    { name: 'Fatima Rahman', email: 'fatima.finance@ticket.local', password: 'password123', roleName: 'Finance Agent' },
    { name: 'Nayeem Hasan', email: 'nayeem.tech@ticket.local', password: 'password123', roleName: 'Tech Support' },
    { name: 'Tanvir Alam', email: 'tanvir.tech@ticket.local', password: 'password123', roleName: 'Tech Support' },
    { name: 'Sadia Ahmed', email: 'sadia.product@ticket.local', password: 'password123', roleName: 'Product Team' },
    { name: 'Imran Hossain', email: 'imran.support@ticket.local', password: 'password123', roleName: 'Support Team' },
    { name: 'Mitu Akter', email: 'mitu.support@ticket.local', password: 'password123', roleName: 'Support Team' },
  ];

  const users: User[] = [];
  for (const input of usersInput) {
    const role = roleByName.get(input.roleName);
    if (!role) {
      throw new Error(`Role not found while seeding users: ${input.roleName}`);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      roleId: role.id,
    });

    users.push(await userRepository.save(user));
  }

  const userByEmail = new Map(users.map((user) => [user.email, user]));

  const customersInput: SeedCustomer[] = [
    { name: 'Acme Retail', email: 'ops@acmeretail.com', phone: '+1-202-555-0101', password: 'customer123' },
    { name: 'Northwind Health', email: 'help@northwindhealth.com', phone: '+1-202-555-0102', password: 'customer123' },
    { name: 'BlueRiver Tech', email: 'it@blueriver.tech', phone: '+1-202-555-0103', password: 'customer123' },
    { name: 'GreenMart', email: 'support@greenmart.io', phone: '+1-202-555-0104', password: 'customer123' },
    { name: 'Skyline ERP', email: 'admin@skylineerp.ai', phone: '+1-202-555-0105', password: 'customer123' },
  ];

  const customers: Customer[] = [];
  for (const input of customersInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const customer = customerRepository.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
    });

    customers.push(await customerRepository.save(customer));
  }

  const customerByName = new Map(customers.map((customer) => [customer.name, customer]));

  const categoryNames = ['Billing', 'Bug', 'Feature Request', 'Support'];
  const categories = await categoryRepository.save(categoryNames.map((name) => categoryRepository.create({ name })));
  const categoryByName = new Map(categories.map((category) => [category.name, category]));

  const ticketSeed = [
    {
      title: 'Charged twice for March invoice',
      description: 'Our finance team noticed duplicate charge for March subscription. Please reverse one charge.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      category: 'Billing',
      creator: 'admin@ticket.local',
      assignee: 'fatima.finance@ticket.local',
      customer: 'Acme Retail',
      aiConfidence: 0.86,
      summary: 'Duplicate subscription charge reported for March invoice and refund requested.',
    },
    {
      title: 'Mobile app crashes on login',
      description: 'App crashes every time users attempt login on Android 14 after latest release.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.URGENT,
      category: 'Bug',
      creator: 'imran.support@ticket.local',
      assignee: 'nayeem.tech@ticket.local',
      customer: 'Northwind Health',
      aiConfidence: 0.94,
      summary: 'Android login crash affecting all users after release.',
    },
    {
      title: 'Need export to CSV in reports',
      description: 'Can you add export to CSV option in analytics reports page? This is needed monthly.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      category: 'Feature Request',
      creator: 'mitu.support@ticket.local',
      assignee: 'sadia.product@ticket.local',
      customer: 'BlueRiver Tech',
      aiConfidence: 0.79,
      summary: 'Requested CSV export capability for analytics reporting.',
    },
    {
      title: 'Password reset email not received',
      description: 'User did not receive password reset email despite multiple attempts.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.MEDIUM,
      category: 'Support',
      creator: 'imran.support@ticket.local',
      assignee: 'mitu.support@ticket.local',
      customer: 'GreenMart',
      aiConfidence: 0.41,
      summary: 'Password reset mail delivery issue addressed by support.',
    },
    {
      title: 'Invoice PDF missing tax breakdown',
      description: 'Invoice PDF for enterprise account does not include VAT line items.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: 'Billing',
      creator: 'admin@ticket.local',
      assignee: 'fatima.finance@ticket.local',
      customer: 'Skyline ERP',
      aiConfidence: 0.82,
      summary: 'Enterprise invoice PDF missing tax details.',
    },
    {
      title: 'Search results stale after update',
      description: 'After data update, search index returns old records for several minutes.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: 'Bug',
      creator: 'tanvir.tech@ticket.local',
      assignee: 'nayeem.tech@ticket.local',
      customer: 'Acme Retail',
      aiConfidence: 0.88,
      summary: 'Search index inconsistency causes stale results post-update.',
    },
    {
      title: 'Add dark mode toggle',
      description: 'Users are asking for dark mode setting in web dashboard.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      category: 'Feature Request',
      creator: 'sadia.product@ticket.local',
      assignee: 'sadia.product@ticket.local',
      customer: 'Northwind Health',
      aiConfidence: 0.67,
      summary: 'Feature request for dark mode in dashboard settings.',
    },
    {
      title: 'Need onboarding assistance for new staff',
      description: 'Please guide our two new agents on queue setup and ticket labels.',
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      category: 'Support',
      creator: 'mitu.support@ticket.local',
      assignee: 'imran.support@ticket.local',
      customer: 'BlueRiver Tech',
      aiConfidence: 0.39,
      summary: 'Support onboarding session requested for new agents.',
    },
  ];

  const tickets: Ticket[] = [];
  for (const seed of ticketSeed) {
    const category = categoryByName.get(seed.category);
    const creator = userByEmail.get(seed.creator);
    const assignee = userByEmail.get(seed.assignee);
    const customer = customerByName.get(seed.customer);

    if (!category || !creator || !assignee || !customer) {
      throw new Error(`Failed to map foreign keys for ticket: ${seed.title}`);
    }

    const ticket = ticketRepository.create({
      title: seed.title,
      description: seed.description,
      status: seed.status,
      priority: seed.priority,
      categoryId: category.id,
      createdBy: creator.id,
      assignedTo: assignee.id,
      customerId: customer.id,
      aiConfidence: seed.aiConfidence,
      aiSource: 'MOCK',
      summary: seed.summary,
    });

    tickets.push(await ticketRepository.save(ticket));
  }

  const commentsSeed = [
    { ticketIndex: 0, userEmail: 'fatima.finance@ticket.local', comment: 'Investigating payment gateway logs.' },
    { ticketIndex: 1, userEmail: 'nayeem.tech@ticket.local', comment: 'Crash reproduced, hotfix in progress.' },
    { ticketIndex: 2, userEmail: 'sadia.product@ticket.local', comment: 'Added to Q2 feature backlog.' },
    { ticketIndex: 3, userEmail: 'mitu.support@ticket.local', comment: 'Issue resolved after mail provider sync.' },
    { ticketIndex: 4, userEmail: 'fatima.finance@ticket.local', comment: 'Need sample invoice from customer.' },
    { ticketIndex: 5, userEmail: 'tanvir.tech@ticket.local', comment: 'Cache invalidation patch deployed to staging.' },
  ];

  for (const seed of commentsSeed) {
    const ticket = tickets[seed.ticketIndex];
    const user = userByEmail.get(seed.userEmail);

    if (!ticket || !user) {
      throw new Error(`Failed to map comment seed for ticket index ${seed.ticketIndex}`);
    }

    const comment = commentRepository.create({
      ticketId: ticket.id,
      userId: user.id,
      comment: seed.comment,
    });

    await commentRepository.save(comment);
  }

  console.log('Seeding complete.');
  console.log(`Roles: ${await roleRepository.count()}`);
  console.log(`Users: ${await userRepository.count()}`);
  console.log(`Customers: ${await customerRepository.count()}`);
  console.log(`Categories: ${await categoryRepository.count()}`);
  console.log(`Tickets: ${await ticketRepository.count()}`);
  console.log(`Comments: ${await commentRepository.count()}`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
