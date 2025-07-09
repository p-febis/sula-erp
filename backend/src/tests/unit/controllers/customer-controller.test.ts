import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ICustomerController,
  CustomerController,
} from "@/controllers/CustomerController";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";

vi.mock("@/utils/body-parser", () => ({
  parseBodyAsync: async (event: H3Event) => {
    return event.req.body;
  },
}));

describe("CustomerController", () => {
  const mockCustomerService = {
    createCustomer: vi.fn(),
    allCustomers: vi.fn(),
    getCustomer: vi.fn(),
    updateCustomer: vi.fn(),
  };

  let customerController: ICustomerController;

  beforeEach(() => {
    vi.resetAllMocks();

    customerController = new CustomerController(mockCustomerService);
  });

  it("Should call createCustomer with correct data", async () => {
    mockCustomerService.createCustomer.mockResolvedValueOnce({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    const request = createRequest({
      method: "POST",
      body: {
        name: "John Doe & Co",
        email: "doe@example.com",
        phone: "+1 (206) 342-8631",
      },
    });

    const event = new H3Event(request);
    const response = await customerController.postCreate(event);

    expect(mockCustomerService.createCustomer).toHaveBeenCalledExactlyOnceWith({
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    expect(response.status).toBe(201);
    expect(response.message).toBe("Created customer!");
    expect(response.data).toEqual({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });
  });

  it("Should call createCustomer with only required info", async () => {
    mockCustomerService.createCustomer.mockResolvedValueOnce({
      id: 1,
      name: "Jane Doe & Co",
      email: null,
      phone: null,
    });

    const request = createRequest({
      method: "POST",
      body: {
        name: "Jane Doe & Co",
      },
    });

    const event = new H3Event(request);
    const response = await customerController.postCreate(event);

    expect(mockCustomerService.createCustomer).toHaveBeenCalledExactlyOnceWith({
      name: "Jane Doe & Co",
    });

    expect(response.status).toBe(201);
    expect(response.message).toBe("Created customer!");
    expect(response.data).toEqual({
      id: 1,
      name: "Jane Doe & Co",
      email: null,
      phone: null,
    });
  });

  it("Should throw error when no customer name is given", async () => {
    const request = createRequest({
      method: "POST",
      body: {
        email: "doe@example.com",
        phone: "+1 (206) 342-8631",
      },
    });

    const event = new H3Event(request);
    const error = await customerController.postCreate(event).catch((e) => e);

    expect(error.cause).toEqual({
      status: 400,
      statusText: "Bad Request",
      message: "Bad Request",
      data: null,
    });
  });

  it("Should return the customers succesfully", async () => {
    mockCustomerService.allCustomers.mockResolvedValueOnce([
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

    const request = createRequest({
      method: "GET",
    });

    const event = new H3Event(request);
    const response = await customerController.getAll(event);

    expect(mockCustomerService.allCustomers).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(response.message).toBe("Success");
    expect(response.data).toEqual([
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
  });

  it("Should get a single customer", async () => {
    mockCustomerService.getCustomer.mockResolvedValueOnce({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    const request = createRequest({
      method: "GET",
    });

    const event = new H3Event(request);
    event.context.params = { id: "1" };

    const response = await customerController.getOne(event);
    expect(mockCustomerService.getCustomer).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    expect(response.message).toBe("Success");
    expect(response.data).toEqual({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });
  });

  it("Should update a customer", async () => {
    mockCustomerService.updateCustomer.mockResolvedValueOnce({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    const request = createRequest({
      method: "PATCH",
      body: {
        name: "John Doe & Co",
        email: "doe@example.com",
        phone: "+1 (206) 342-8631",
      },
    });

    const event = new H3Event(request);
    event.context.params = { id: "1" };

    const response = await customerController.updateOne(event);
    expect(mockCustomerService.updateCustomer).toHaveBeenCalledExactlyOnceWith(
      1,
      {
        name: "John Doe & Co",
        email: "doe@example.com",
        phone: "+1 (206) 342-8631",
      },
    );
    expect(response.status).toBe(200);
    expect(response.message).toBe("Success");
    expect(response.data).toEqual({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });
  });
});
