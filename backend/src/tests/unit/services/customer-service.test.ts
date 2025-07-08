import { beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerService, ICustomerService } from "@/services/CustomerService";
import { ICustomerRepository } from "@/repositories/CustomerRepository";

describe("CustomerService", () => {
  let customerService: ICustomerService;
  let mockCustomerRepository = {
    create: vi.fn(),
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
});
