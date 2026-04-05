import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seedDefaultCategories(): Promise<void> {
    const defaults = ['Billing', 'Bug', 'Feature Request', 'Support'];

    for (const name of defaults) {
      const existing = await this.categoryRepository.findOne({ where: { name } });
      if (!existing) {
        await this.categoryRepository.save(this.categoryRepository.create({ name }));
      }
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { id: 'ASC' } });
  }

  findByName(name: string): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { name } });
  }
}
