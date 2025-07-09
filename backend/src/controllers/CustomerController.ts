import {
  CreateCustomerDtoSchema,
  UpdateCustomerDtoSchema,
} from "@/models/customer";
import { ErrorResponse, SuccessResponse } from "@/responses/api";
import { ICustomerService } from "@/services/CustomerService";
import { parseBodyAsync } from "@/utils/body-parser";
import { H3Event } from "h3";

export interface ICustomerController {
  postCreate(event: H3Event): Promise<SuccessResponse>;
  getAll(event: H3Event): Promise<SuccessResponse>;
  getOne(event: H3Event): Promise<SuccessResponse>;
  updateOne(event: H3Event): Promise<SuccessResponse>;
  deleteOne(event: H3Event): Promise<SuccessResponse>;
}

export class CustomerController implements ICustomerController {
  m_customerService: ICustomerService;

  constructor(customerService: ICustomerService) {
    this.m_customerService = customerService;
  }

  async postCreate(event: H3Event) {
    let creationData = null;

    try {
      const body = await parseBodyAsync(event);
      creationData = CreateCustomerDtoSchema.parse(body);
    } catch (error) {
      throw new ErrorResponse("Bad Request", null);
    }
    const customer = await this.m_customerService.createCustomer(creationData);
    return new SuccessResponse("Created customer!", customer, 201);
  }

  async getAll(event: H3Event) {
    const customers = await this.m_customerService.allCustomers();
    return new SuccessResponse("Success", customers);
  }

  async getOne(event: H3Event) {
    const { id } = event.context.params!;
    const customer = await this.m_customerService.getCustomer(Number(id));

    return new SuccessResponse("Success", customer);
  }

  async updateOne(event: H3Event) {
    const { id } = event.context.params!;
    let creationData = null;

    try {
      const body = await parseBodyAsync(event);
      creationData = UpdateCustomerDtoSchema.parse(body);
    } catch (error) {
      throw new ErrorResponse("Bad Request", null);
    }
    const customer = await this.m_customerService.updateCustomer(
      Number(id),
      creationData,
    );

    return new SuccessResponse("Success", customer);
  }

  async deleteOne(event: H3Event) {
    const { id } = event.context.params!;
    const deletedCustomer = await this.m_customerService.deleteCustomer(
      Number(id),
    );
    return new SuccessResponse("Success", deletedCustomer);
  }
}
