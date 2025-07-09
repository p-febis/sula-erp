import { Customer, PrismaClient } from "@/../generated/prisma";
import { CreateCustomerDto, UpdateCustomerDto } from "@/models/customer";

export interface ICustomerRepository {
  create(customerCreationData: CreateCustomerDto): Promise<Customer | null>;
  findAll(): Promise<Customer[] | null>;
  findById(id: number): Promise<Customer | null>;
  updateById(
    id: number,
    updateData: UpdateCustomerDto,
  ): Promise<Customer | null>;
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

  async findAll() {
    const customers = await this.client.customer.findMany();
    return customers;
  }
  async findById(id: number) {
    const customer = await this.client.customer.findUnique({
      where: {
        id,
      },
    });

    return customer;
  }
  async updateById(id: number, updateData: UpdateCustomerDto) {
    const customer = await this.client.customer.update({
      where: {
        id,
      },
      data: updateData,
    });

    return customer;
  }
}
