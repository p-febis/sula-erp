import { Customer } from "@/db/db";
import { CreateCustomerDto, UpdateCustomerDto } from "@/models/customer";
import { ICustomerRepository } from "@/repositories/CustomerRepository";
import { Selectable } from "kysely";

export interface ICustomerService {
  createCustomer(
    customerCreationData: CreateCustomerDto,
  ): Promise<Selectable<Customer> | null>;

  allCustomers(): Promise<Selectable<Customer>[] | null>;
  getCustomer(id: number): Promise<Selectable<Customer> | null>;
  updateCustomer(
    id: number,
    customerUpdateData: UpdateCustomerDto,
  ): Promise<Selectable<Customer> | null>;
  deleteCustomer(id: number): Promise<Selectable<Customer> | null>;
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
