import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerService, ICustomerService } from "@/services/CustomerService";

describe("CustomerService", () => {
  let customerService: ICustomerService;
  let mockCustomerRepository = {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    updateById: vi.fn(),
    deleteById: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    customerService = new CustomerService(mockCustomerRepository);
  });

  it("Should create a customer", async () => {
    mockCustomerRepository.create.mockResolvedValueOnce({
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    const customer = await customerService.createCustomer({
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    expect(customer).toEqual({
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    expect(mockCustomerRepository.create).toHaveBeenCalledExactlyOnceWith({
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });
  });

  it("Should return all customers", async () => {
    mockCustomerRepository.findAll.mockResolvedValueOnce([
      {
        id: 1,
        name: "John Doe & Co",
        email: "doe@example.com",
        phone: "+1 (206) 342-8631",
      },
      {
        id: 2,
        name: "Jane Doe & Parnets",
        email: "jane.doe@example.com",
        phone: "+1 (206) 343-8888",
      },
    ]);

    const customers = await customerService.allCustomers();

    expect(customers).toEqual([
      {
        id: 1,
        name: "John Doe & Co",
        email: "doe@example.com",
        phone: "+1 (206) 342-8631",
      },
      {
        id: 2,
        name: "Jane Doe & Parnets",
        email: "jane.doe@example.com",
        phone: "+1 (206) 343-8888",
      },
    ]);

    expect(mockCustomerRepository.findAll).toHaveBeenCalledOnce();
  });

  it("Should return one customer", async () => {
    mockCustomerRepository.findById.mockResolvedValueOnce({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    const customer = await customerService.getCustomer(1);

    expect(customer).toEqual({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    expect(mockCustomerRepository.findById).toHaveBeenCalledOnce();
  });

  it("Should update a customer", async () => {
    mockCustomerRepository.updateById.mockResolvedValueOnce({
      id: 1,
      name: "Doe, Jannsen & Partners",
      email: "doe@jannsen.com",
      phone: "+1 (206) 342-8631",
    });

    const customer = await customerService.updateCustomer(1, {
      name: "Doe, Jannsen & Partners",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    expect(mockCustomerRepository.updateById).toHaveBeenCalledExactlyOnceWith(
      1,
      {
        name: "Doe, Jannsen & Partners",
        email: "doe@example.com",
        phone: "+1 (206) 342-8631",
      },
    );

    expect(customer).toEqual({
      id: 1,
      name: "Doe, Jannsen & Partners",
      email: "doe@jannsen.com",
      phone: "+1 (206) 342-8631",
    });
  });

  it("Should delete a customer", async () => {
    mockCustomerRepository.deleteById.mockResolvedValueOnce({
      id: 1,
      name: "Doe, Jannsen & Partners",
      email: "doe@jannsen.com",
      phone: "+1 (206) 342-8631",
    });

    const deletedCustomer = await customerService.deleteCustomer(1);

    expect(mockCustomerRepository.deleteById).toHaveBeenCalledExactlyOnceWith(
      1,
    );
    expect(deletedCustomer).toEqual({
      id: 1,
      name: "Doe, Jannsen & Partners",
      email: "doe@jannsen.com",
      phone: "+1 (206) 342-8631",
    });
  });
});
