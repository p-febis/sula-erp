import { Inject, Injectable } from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import * as schema from "../db/schema";
import { eq, count } from "drizzle-orm";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersRepository {
  constructor(
    @Inject("DB") private drizzle: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createCustomerData: CreateCustomerDto) {
    try {
      const customersList = await this.drizzle
        .insert(schema.customersTable)
        .values(createCustomerData)
        .returning();
      const [customer] = customersList;
      return ok(customer ?? null);
    } catch (e) {
      return err("Failed to insert");
    }
  }

  async findAll() {
    try {
      const customers = await this.drizzle.select().from(schema.customersTable);

      return ok(customers);
    } catch (e) {
      return err("Failed to select");
    }
  }

  async findOne(id: number) {
    try {
      const customers = await this.drizzle
        .select()
        .from(schema.customersTable)
        .where(eq(schema.customersTable.id, id));

      const customer = customers[0] ?? null;

      return ok(customer);
    } catch (e) {
      return err("Failed to select");
    }
  }

  async updateOne(id: number, updateCustomerData: UpdateCustomerDto) {
    try {
      const customers = await this.drizzle
        .update(schema.customersTable)
        .set(updateCustomerData)
        .where(eq(schema.customersTable.id, id))
        .returning();

      const [customer] = customers;

      return ok(customer ?? null);
    } catch (e) {
      return err("Failed to update");
    }
  }

  async deleteOne(id: number) {
    try {
      const customers = await this.drizzle
        .delete(schema.customersTable)
        .where(eq(schema.customersTable.id, id))
        .returning();

      const [customer] = customers;

      return ok(customer ?? null);
    } catch (e) {
      return err("Failed to delete");
    }
  }
}
