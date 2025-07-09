import { CreateCustomerDto, UpdateCustomerDto } from "@/models/customer";
import { ICustomerRepository } from "@/repositories/CustomerRepository";
import { Customer } from "generated/prisma";

export interface ICustomerService {
  createCustomer(
    customerCreationData: CreateCustomerDto,
  ): Promise<Customer | null>;

  allCustomers(): Promise<Customer[] | null>;
  getCustomer(id: number): Promise<Customer | null>;
  updateCustomer(
    id: number,
    customerUpdateData: UpdateCustomerDto,
  ): Promise<Customer | null>;
  deleteCustomer(id: number): Promise<Customer | null>;
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

  async updateCustomer(id: number, customerUpdateData: UpdateCustomerDto) {
    const updatedCustomer = await this.m_customerRepository.updateById(
      id,
      customerUpdateData,
    );
    return updatedCustomer;
  }

  async deleteCustomer(id: number) {
    const deletedCustomer = await this.m_customerRepository.deleteById(id);
    return deletedCustomer;
  }
}
