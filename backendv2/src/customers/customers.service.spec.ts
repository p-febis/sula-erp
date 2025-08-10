import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { CustomersService } from "./customers.service";
import { CustomersRepository } from "./customers.repository";
import { ok } from "neverthrow";

describe("CustomersService", () => {
  let service: CustomersService;

  const mockCustomersRepository = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    updateOne: vi.fn(),
    deleteOne: vi.fn(),
  };

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

  const sampleCustomer = {
    id: 1,
    name: "John Doe",
    email: "john@doeenterprises.com",
    phone: "123456789",
  };

  describe("Creation", () => {
    it("should create a customer with valid data", async () => {
      mockCustomersRepository.create.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await service.create({
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      });

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

      expect(customersResult).toEqual(ok(sampleCustomers));
    });

    it("should find one customer", async () => {
      mockCustomersRepository.findOne.mockResolvedValueOnce(ok(sampleCustomer));

      const customerResult = await service.findOne(1);

      expect(customerResult).toEqual(ok(sampleCustomer));
    });
  });

  describe("Updating", () => {
    it("should update a customer with valid data", async () => {
      mockCustomersRepository.updateOne.mockResolvedValueOnce(
        ok(sampleCustomer),
      );

      const customerResult = await service.updateOne(1, {
        name: "John Doe",
        email: "john@doeenterprises.com",
        phone: "123456789",
      });

      expect(customerResult).toEqual(ok(sampleCustomer));
    });
  });

  describe("Deleting", () => {
    it("should delete a customer", async () => {
      mockCustomersRepository.deleteOne.mockResolvedValueOnce(
        ok(sampleCustomer),
      );

      const customerResult = await service.deleteOne(1);
      expect(customerResult).toEqual(ok(sampleCustomer));
    });
  });
});
