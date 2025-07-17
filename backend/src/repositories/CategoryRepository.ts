import { Category, DB } from "@/db/db";
import { CreateCategoryDto } from "@/models/category";
import { Kysely } from "kysely";
import { Selectable } from "kysely";

export interface ICategoryRepository {
  create(
    createCategoryData: CreateCategoryDto,
  ): Promise<Selectable<Category> | null>;
}

export class CategoryRepository implements ICategoryRepository {
  constructor(private client: Kysely<DB>) {}

  async create(createCategoryData: CreateCategoryDto) {
    const category =
      (await this.client
        .insertInto("category")
        .values(createCategoryData)
        .returningAll()
        .executeTakeFirst()) ?? null;

    return category;
  }
}
