import { CreateCustomerDtoSchema } from "@/models/customer";
import { ErrorResponse, SuccessResponse } from "@/responses/api";
import { ICustomerService } from "@/services/CustomerService";
import { parseBodyAsync } from "@/utils/body-parser";
import { H3Event } from "h3";

export interface ICustomerController {
  postCreate(event: H3Event): Promise<SuccessResponse>;
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
    const customer = this.m_customerService.createCustomer(creationData);
    return new SuccessResponse("Created customer!", customer);
  }
}
