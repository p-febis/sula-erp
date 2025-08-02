import { Test, TestingModule } from "@nestjs/testing";
import { CustomersController } from "./customers.controller";
import { CustomersService } from "./customers.service";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import { ok, err } from "neverthrow";
import { ApiResponse } from "../api-response";
import { HttpException } from "@nestjs/common";
import { AuthenticationGuard } from "../authentication/authentication.guard";
import { JwtService } from "../jwt/jwt.service";
import { assertAuthorizationWithPermissions } from "../tests/helpers";

describe("CustomersController", () => {
  let controller: CustomersController;

  const sampleCustomer = {
    id: 1,
    name: "John Doe",
    email: "john@doeenterprises.com",
    phone: "123456789",
  };

  const mockCustomersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  } as unknown as jest.Mocked<CustomersService>;

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
        {
          provide: JwtService,
          useValue: null,
        },
        {
          provide: AuthenticationGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          } as unknown as jest.Mocked<AuthenticationGuard>,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("Creation", () => {
    it("should be protected", async () => {
      assertAuthorizationWithPermissions(CustomersController.prototype.create, [
        "create:customer",
      ]);
    });

    it("should create a customer with valid data", async () => {
      mockCustomersService.create.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await controller.create({
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      });

      expect(mockCustomersService.create).toHaveBeenCalledTimes(1);
      expect(mockCustomersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john@doeenterprises.com",
          phone: "123456789",
        }),
      );

      expect(customerResult).toBeInstanceOf(ApiResponse);
      expect(customerResult).toEqual(
        expect.objectContaining({ statusCode: 201, data: sampleCustomer }),
      );
    });

    it("should throw error on failure", async () => {
      mockCustomersService.create.mockResolvedValueOnce(
        err("Failed to insert"),
      );

      const error = await controller
        .create({
          name: "John Doe",
          email: "john@doeenterprises.com",
          phone: "123456789",
        })
        .catch((e) => e);

      expect(error).toBeInstanceOf(HttpException);
      expect(error.getStatus()).toBe(500);

      expect(mockCustomersService.create).toHaveBeenCalledTimes(1);
      expect(mockCustomersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john@doeenterprises.com",
          phone: "123456789",
        }),
      );
    });
  });

  describe("Finding", () => {
    it.each([
      { toTest: CustomersController.prototype.findAll },
      { toTest: CustomersController.prototype.findOne },
    ])("find all should be protected", async ({ toTest }) => {
      assertAuthorizationWithPermissions(toTest, ["read:customer"]);
    });

    it("should find all customers", async () => {
      const sampleCustomers = [
        sampleCustomer,
        {
          id: 2,
          name: "Jane Doe",
          email: "jane@doeenterprises.com",
          phone: "987654321",
        },
      ];

      mockCustomersService.findAll.mockResolvedValueOnce(ok(sampleCustomers));

      const customersResult = await controller.findAll();

      expect(mockCustomersService.findAll).toHaveBeenCalledTimes(1);
      expect(customersResult).toBeInstanceOf(ApiResponse);
      expect(customersResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleCustomers }),
      );
    });

    it("should return error if findAll fails", async () => {
      mockCustomersService.findAll.mockResolvedValueOnce(
        err("Failed to select"),
      );

      const customersResult = await controller.findAll().catch((e) => e);

      expect(mockCustomersService.findAll).toHaveBeenCalledTimes(1);
      expect(customersResult).toBeInstanceOf(HttpException);
      expect(customersResult.getStatus()).toBe(500);
    });

    it("should find a customer by id", async () => {
      const sampleCustomer = {
        id: 1,
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      };

      mockCustomersService.findOne.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await controller.findOne("1");

      expect(mockCustomersService.findOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersService.findOne).toHaveBeenCalledWith(1);

      expect(customerResult).toBeInstanceOf(ApiResponse);
      expect(customerResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleCustomer }),
      );
    });

    it("should return error if findOne fails", async () => {
      mockCustomersService.findOne.mockResolvedValueOnce(
        err("Failed to select"),
      );

      const customerResult = await controller.findOne("1").catch((e) => e);

      expect(mockCustomersService.findOne).toHaveBeenCalledTimes(1);
      expect(customerResult).toBeInstanceOf(HttpException);
      expect(customerResult.getStatus()).toBe(500);
    });
  });

  describe("Updating", () => {
    it("update should be protected", async () => {
      assertAuthorizationWithPermissions(
        CustomersController.prototype.updateOne,
        ["update:customer"],
      );
    });

    it("should call updateOne on service", async () => {
      mockCustomersService.updateOne.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await controller.updateOne("1", {
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      });

      expect(mockCustomersService.updateOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersService.updateOne).toHaveBeenCalledWith(1, {
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      });

      expect(customerResult).toBeInstanceOf(ApiResponse);
      expect(customerResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleCustomer }),
      );
    });

    it("should return error if updateOne fails", async () => {
      mockCustomersService.updateOne.mockResolvedValueOnce(
        err("Failed to update"),
      );

      const customerResult = await controller
        .updateOne("1", {
          name: "John Doe",
          email: "john@doeenterprises.com",
          phone: "123456789",
        })
        .catch((e) => e);

      expect(mockCustomersService.updateOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersService.updateOne).toHaveBeenCalledWith(1, {
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      });

      expect(customerResult).toBeInstanceOf(HttpException);
      expect(customerResult.getStatus()).toBe(500);
    });
  });

  describe("Deleting", () => {
    it("delete should be protected", async () => {
      assertAuthorizationWithPermissions(
        CustomersController.prototype.deleteOne,
        ["delete:customer"],
      );
    });

    it("should call removeOne on service", async () => {
      mockCustomersService.deleteOne.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await controller.deleteOne("1");

      expect(mockCustomersService.deleteOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersService.deleteOne).toHaveBeenCalledWith(1);

      expect(customerResult).toBeInstanceOf(ApiResponse);
      expect(customerResult).toEqual(
        expect.objectContaining({ statusCode: 200, data: sampleCustomer }),
      );
    });

    it("should return error if removeOne fails", async () => {
      mockCustomersService.deleteOne.mockResolvedValueOnce(
        err("Failed to delete"),
      );

      const customerResult = await controller.deleteOne("1").catch((e) => e);

      expect(mockCustomersService.deleteOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersService.deleteOne).toHaveBeenCalledWith(1);

      expect(customerResult).toBeInstanceOf(HttpException);
      expect(customerResult.getStatus()).toBe(500);
    });
  });
});
