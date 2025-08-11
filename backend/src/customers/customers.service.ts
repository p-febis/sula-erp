import { Injectable } from "@nestjs/common";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { CustomersRepository } from "./customers.repository";

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const customerResult =
      await this.customersRepository.create(createCustomerDto);

    return customerResult;
  }

  async findAll() {
    const customersResult = await this.customersRepository.findAll();
    return customersResult;
  }

  async findOne(id: number) {
    const customerResult = await this.customersRepository.findOne(id);
    return customerResult;
  }

  async updateOne(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customerResult = await this.customersRepository.updateOne(
      id,
      updateCustomerDto,
    );

    return customerResult;
  }

  async deleteOne(id: number) {
    const customerResult = await this.customersRepository.deleteOne(id);
    return customerResult;
  }
}
