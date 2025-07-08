import { Customer, PrismaClient } from "@/../generated/prisma";
import { CreateCustomerDto } from "@/models/customer";

export interface ICustomerRepository {
  create(customerCreationData: CreateCustomerDto): Promise<Customer | null>;
  getAll(): Promise<Customer[] | null>;
}

export class CustomerRepository implements ICustomerRepository {
  client: PrismaClient;

  constructor(client: PrismaClient) {
    this.client = client;
  }

  async create(customerCreationData: CreateCustomerDto) {
    const customer = this.client.customer.create({
      data: customerCreationData,
    });
    return customer;
  }

  async getAll() {
    const customers = await this.client.customer.findMany();
    return customers;
  }
}
