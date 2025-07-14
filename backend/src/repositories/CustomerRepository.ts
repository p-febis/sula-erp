import { Customer, DB } from "@/db/db";
import { CreateCustomerDto, UpdateCustomerDto } from "@/models/customer";
import { Selectable } from "kysely";
import { Kysely } from "kysely";

export interface ICustomerRepository {
  create(customerCreationData: CreateCustomerDto): Promise<Selectable<Customer> | null>;
  findAll(): Promise<Selectable<Customer>[] | null>;
  findById(id: number): Promise<Selectable<Customer> | null>;
  deleteById(id: number): Promise<Selectable<Customer> | null>;
  updateById(
    id: number,
    updateData: UpdateCustomerDto,
  ): Promise<Selectable<Customer> | null>;
}

export class CustomerRepository implements ICustomerRepository {
  client: Kysely<DB>;

  constructor(client: Kysely<DB>) {
    this.client = client;
  }

  async create(customerCreationData: CreateCustomerDto) {
    const customer = await this.client.insertInto("customer")
      .values(customerCreationData)
      .returningAll()
      .executeTakeFirst();

    return customer ?? null;
  }

  async findAll() {
    const customers = await this.client.selectFrom("customer")
      .selectAll()
      .execute();

    return customers ?? null;
  }
  async findById(id: number) {
    const customer = await this.client.selectFrom("customer")
      .where("customer.id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return customer ?? null;
  }
  async updateById(id: number, updateData: UpdateCustomerDto) {
    const customer = await this.client.updateTable("customer")
      .set(updateData)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return customer ?? null;
  }

  async deleteById(id: number) {
    const customer = await this.client.deleteFrom("customer")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return customer ?? null;
  }
}
