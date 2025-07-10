import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerService, ICustomerService } from "@/services/CustomerService";

describe("CustomerService", () => {
  let service: ICustomerService;

  const mockCustomerRepository = {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  };

  const customerData = {
    name: "John Doe & Co",
    email: "doe@example.com",
    phone: "+1 (206) 342-8631",
  };

  const fullCustomer = {
    id: 1,
    ...customerData,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    service = new CustomerService(mockCustomerRepository);
  });

  it("should create a customer", async () => {
    mockCustomerRepository.create.mockResolvedValueOnce(customerData);

    const result = await service.createCustomer(customerData);

    expect(result).toEqual(customerData);
    expect(mockCustomerRepository.create).toHaveBeenCalledExactlyOnceWith(
      customerData,
    );
  });

  it("should return all customers", async () => {
    const allCustomers = [
      fullCustomer,
      {
        id: 2,
        name: "Jane Doe & Partners",
        email: "jane.doe@example.com",
        phone: "+1 (206) 343-8888",
      },
    ];

    mockCustomerRepository.findAll.mockResolvedValueOnce(allCustomers);

    const result = await service.allCustomers();

    expect(result).toEqual(allCustomers);
    expect(mockCustomerRepository.findAll).toHaveBeenCalledOnce();
  });

  it("should return one customer by ID", async () => {
    mockCustomerRepository.findById.mockResolvedValueOnce(fullCustomer);

    const result = await service.getCustomer(1);

    expect(result).toEqual(fullCustomer);
    expect(mockCustomerRepository.findById).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("should update a customer", async () => {
    const updateInput = {
      name: "Doe, Jannsen & Partners",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    };

    const updated = {
      id: 1,
      name: "Doe, Jannsen & Partners",
      email: "doe@jannsen.com",
      phone: "+1 (206) 342-8631",
    };

    mockCustomerRepository.updateById.mockResolvedValueOnce(updated);

    const result = await service.updateCustomer(1, updateInput);

    expect(result).toEqual(updated);
    expect(mockCustomerRepository.updateById).toHaveBeenCalledExactlyOnceWith(
      1,
      updateInput,
    );
  });

  it("should delete a customer", async () => {
    mockCustomerRepository.deleteById.mockResolvedValueOnce(fullCustomer);

    const result = await service.deleteCustomer(1);

    expect(result).toEqual(fullCustomer);
    expect(mockCustomerRepository.deleteById).toHaveBeenCalledExactlyOnceWith(
      1,
    );
  });
});
