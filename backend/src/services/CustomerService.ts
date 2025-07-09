import { CreateCustomerDto } from "@/models/customer";
import { ICustomerRepository } from "@/repositories/CustomerRepository";
import { Customer } from "generated/prisma";

export interface ICustomerService {
  createCustomer(
    customerCreationData: CreateCustomerDto,
  ): Promise<Customer | null>;

  allCustomers(): Promise<Customer[] | null>;
  getCustomer(id: number): Promise<Customer | null>;
}

export class CustomerService implements ICustomerService {
  m_customerRepository: ICustomerRepository;

  constructor(customerRepository: ICustomerRepository) {
    this.m_customerRepository = customerRepository;
  }

  async createCustomer(customerCreationData: CreateCustomerDto) {
    const customer =
      await this.m_customerRepository.create(customerCreationData);
    return customer;
  }

  async allCustomers() {
    const customers = await this.m_customerRepository.findAll();

    return customers;
  }

  async getCustomer(id: number) {
    const customer = await this.m_customerRepository.findById(id);
    return customer;
  }
}
