import { Module } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CustomersController } from "./customers.controller";
import { CustomersRepository } from "./customers.repository";
import { JwtService } from "../jwt/jwt.service";

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository, JwtService],
})
export class CustomersModule {}
