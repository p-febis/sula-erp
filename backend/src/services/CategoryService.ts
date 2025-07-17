import { Category } from "@/db/db";
import { CreateCategoryDto } from "@/models/category";
import { ICategoryRepository } from "@/repositories/CategoryRepository";
import { Selectable } from "kysely";

export interface ICategoryService {
  createCategory(
    createCategoryData: CreateCategoryDto,
  ): Promise<Selectable<Category> | null>;
}

export class CategoryService implements ICategoryService {
  constructor(private m_categoryRepository: ICategoryRepository) {}

  async createCategory(createCategoryData: CreateCategoryDto) {
    const category = this.m_categoryRepository.create(createCategoryData);
    return category;
  }
}
