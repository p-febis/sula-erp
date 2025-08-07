import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  UseGuards,
} from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { ApiResponse } from "../api-response";
import { AuthenticationGuard } from "../authentication/authentication.guard";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { Permission } from "../authorization/permission.decorator";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["create:customer"])
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customerResult =
      await this.customersService.create(createCustomerDto);

    if (customerResult.isErr()) {
      throw new HttpException(ApiResponse.error(customerResult.error), 500);
    }

    return ApiResponse.success(customerResult.value, 201);
  }

  @Get()
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["read:customer"])
  async findAll() {
    const customersResult = await this.customersService.findAll();

    if (customersResult.isErr()) {
      throw new HttpException(ApiResponse.error(customersResult.error), 500);
    }

    return ApiResponse.success(customersResult.value, 200);
  }

  @Get(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["read:customer"])
  async findOne(@Param("id") id: string) {
    const customer = await this.customersService.findOne(+id);

    if (customer.isErr()) {
      throw new HttpException(ApiResponse.error(customer.error), 500);
    }

    return ApiResponse.success(customer.value, 200);
  }

  @Patch(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["update:customer"])
  async updateOne(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.updateOne(
      +id,
      updateCustomerDto,
    );

    if (customer.isErr()) {
      throw new HttpException(ApiResponse.error(customer.error), 500);
    }

    return ApiResponse.success(customer.value, 200);
  }

  @Delete(":id")
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @Permission(["delete:customer"])
  async deleteOne(@Param("id") id: string) {
    const customer = await this.customersService.deleteOne(+id);

    if (customer.isErr()) {
      throw new HttpException(ApiResponse.error(customer.error), 500);
    }

    return ApiResponse.success(customer.value, 200);
  }
}
