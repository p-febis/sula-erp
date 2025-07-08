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
  const mockCustomerSerivce = {
    createCustomer: vi.fn(),
    allCustomers: vi.fn(),
  };

  let customerController: ICustomerController;

  beforeEach(() => {
    vi.resetAllMocks();

    customerController = new CustomerController(mockCustomerSerivce);
  });

  it("Should call createCustomer with correct data", async () => {
    mockCustomerSerivce.createCustomer.mockResolvedValueOnce({
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

    expect(mockCustomerSerivce.createCustomer).toHaveBeenCalledExactlyOnceWith({
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });

    expect(response.status).toBe(200);
    expect(response.message).toBe("Created customer!");
    expect(response.data).toEqual({
      id: 1,
      name: "John Doe & Co",
      email: "doe@example.com",
      phone: "+1 (206) 342-8631",
    });
  });

  it("Should call createCustomer with only required info", async () => {
    mockCustomerSerivce.createCustomer.mockResolvedValueOnce({
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

    expect(mockCustomerSerivce.createCustomer).toHaveBeenCalledExactlyOnceWith({
      name: "Jane Doe & Co",
    });

    expect(response.status).toBe(200);
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
    mockCustomerSerivce.allCustomers.mockResolvedValueOnce([
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

    expect(mockCustomerSerivce.allCustomers).toHaveBeenCalledOnce();
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
});
