import { Test, TestingModule } from "@nestjs/testing";
import { CustomersService } from "./customers.service";
import { CustomersRepository } from "./customers.repository";
import { describe, beforeEach, it, expect, jest } from "@jest/globals";
import { ok } from "neverthrow";

describe("CustomersService", () => {
  let service: CustomersService;

  const mockCustomersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  } as unknown as jest.Mocked<CustomersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: CustomersRepository,
          useValue: mockCustomersRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("Creation", () => {
    it("should create a customer with valid data", async () => {
      const sampleCustomer = {
        id: 1,
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      };

      mockCustomersRepository.create.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await service.create({
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      });

      expect(mockCustomersRepository.create).toHaveBeenCalledTimes(1);
      expect(mockCustomersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "John Doe",
          email: "john@doeenterprises.com",
          phone: "123456789",
        }),
      );

      expect(customerResult).toEqual(ok(sampleCustomer));
    });
  });

  describe("Finding", () => {
    it("should find all customers", async () => {
      const sampleCustomers = [
        {
          id: 1,
          name: "John Doe",
          email: "john@doeenterprises.com",
          phone: "123456789",
        },
        {
          id: 2,
          name: "Jane Doe",
          email: "jane@doeenterprises.com",
          phone: "987654321",
        },
      ];

      mockCustomersRepository.findAll.mockResolvedValueOnce(
        ok(sampleCustomers),
      );

      const customersResult = await service.findAll();

      expect(mockCustomersRepository.findAll).toHaveBeenCalledTimes(1);
      expect(customersResult).toEqual(ok(sampleCustomers));
    });

    it("should find one customer", async () => {
      const sampleCustomer = {
        id: 1,
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      };

      mockCustomersRepository.findOne.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await service.findOne(1);

      expect(mockCustomersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersRepository.findOne).toHaveBeenCalledWith(1);
      expect(customerResult).toEqual(ok(sampleCustomer));
    });
  });

  describe("Updating", () => {
    it("should update a customer with valid data", async () => {
      const sampleUpdatedCustomer = {
        id: 1,
        name: "Jane Doe",
        email: "jane@doeenterprises.com",
        phone: "987654321",
      };

      mockCustomersRepository.updateOne.mockResolvedValueOnce(
        ok(sampleUpdatedCustomer),
      );

      const customerResult = await service.updateOne(1, {
        name: "Jane Doe",
        email: "jane@doeenterprises.com",
        phone: "987654321",
      });

      expect(mockCustomersRepository.updateOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersRepository.updateOne).toHaveBeenCalledWith(1, {
        name: "Jane Doe",
        email: "jane@doeenterprises.com",
        phone: "987654321",
      });

      expect(customerResult).toEqual(ok(sampleUpdatedCustomer));
    });
  });

  describe("Deleting", () => {
    it("should delete a customer", async () => {
      const deletedCustomer = {
        id: 1,
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      };
      mockCustomersRepository.deleteOne.mockResolvedValueOnce(
        ok(deletedCustomer),
      );

      const customerResult = await service.deleteOne(1);
      expect(mockCustomersRepository.deleteOne).toHaveBeenCalledTimes(1);
      expect(mockCustomersRepository.deleteOne).toHaveBeenCalledWith(1);
      expect(customerResult).toEqual(ok(deletedCustomer));
    });
  });
});
