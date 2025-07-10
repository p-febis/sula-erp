import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ICustomerController,
  CustomerController,
} from "@/controllers/CustomerController";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";

vi.mock("@/utils/body-parser", () => ({
  parseBodyAsync: async (event: H3Event) => event.req.body,
}));

describe("CustomerController", () => {
  const mockCustomerService = {
    createCustomer: vi.fn(),
    allCustomers: vi.fn(),
    getCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn(),
  };

  let controller: ICustomerController;

  const sampleCustomer = {
    id: 1,
    name: "John Doe & Co",
    email: "doe@example.com",
    phone: "+1 (206) 342-8631",
  };

  const sampleCreateBody = {
    name: "John Doe & Co",
    email: "doe@example.com",
    phone: "+1 (206) 342-8631",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new CustomerController(mockCustomerService);
  });

  it("should create a customer with full data", async () => {
    mockCustomerService.createCustomer.mockResolvedValueOnce(sampleCustomer);

    const event = new H3Event(
      createRequest({ method: "POST", body: sampleCreateBody }),
    );
    const response = await controller.postCreate(event);

    expect(mockCustomerService.createCustomer).toHaveBeenCalledExactlyOnceWith(sampleCreateBody);
    expect(response).toEqual({
      status: 201,
      statusText: "OK",
      message: "Created customer!",
      data: sampleCustomer,
    });
  });

  it("should create a customer with only name", async () => {
    const body = { name: "Jane Doe & Co" };
    const created = { id: 1, name: body.name, email: null, phone: null };
    mockCustomerService.createCustomer.mockResolvedValueOnce(created);

    const event = new H3Event(createRequest({ method: "POST", body }));
    const response = await controller.postCreate(event);

    expect(mockCustomerService.createCustomer).toHaveBeenCalledExactlyOnceWith(body);
    expect(response).toEqual({
      status: 201,
      statusText: "OK",
      message: "Created customer!",
      data: created,
    });
  });

  it("should throw when no name is provided", async () => {
    const event = new H3Event(
      createRequest({ method: "POST", body: { email: "a@b.com", phone: "123" } }),
    );

    const error = await controller.postCreate(event).catch((e) => e);

    expect(error.cause).toEqual({
      status: 400,
      statusText: "Bad Request",
      message: "Bad Request",
      data: null,
    });
  });

  it("should return all customers", async () => {
    const all = [
      sampleCustomer,
      {
        id: 2,
        name: "Jane Doe & Parents",
        email: "jane@example.com",
        phone: "+1 (206) 343-8888",
      },
    ];

    mockCustomerService.allCustomers.mockResolvedValueOnce(all);

    const event = new H3Event(createRequest({ method: "GET" }));
    const response = await controller.getAll(event);

    expect(mockCustomerService.allCustomers).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: all,
    });
  });

  it("should get a customer by ID", async () => {
    mockCustomerService.getCustomer.mockResolvedValueOnce(sampleCustomer);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.params = { id: "1" };

    const response = await controller.getOne(event);

    expect(mockCustomerService.getCustomer).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleCustomer,
    });
  });

  it("should update a customer", async () => {
    mockCustomerService.updateCustomer.mockResolvedValueOnce(sampleCustomer);

    const body = sampleCreateBody;
    const event = new H3Event(createRequest({ method: "PATCH", body }));
    event.context.params = { id: "1" };

    const response = await controller.updateOne(event);

    expect(mockCustomerService.updateCustomer).toHaveBeenCalledExactlyOnceWith(1, body);
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleCustomer,
    });
  });

  it("should delete a customer", async () => {
    mockCustomerService.deleteCustomer.mockResolvedValueOnce(sampleCustomer);

    const event = new H3Event(createRequest({ method: "DELETE" }));
    event.context.params = { id: "1" };

    const response = await controller.deleteOne(event);

    expect(mockCustomerService.deleteCustomer).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleCustomer,
    });
  });
});
