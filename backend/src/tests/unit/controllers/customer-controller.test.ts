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

  const mockAuthorizationService = {
    userCanDo: vi.fn(),
  };
  let controller: ICustomerController;

  const baseClaims = {
    isSuperUser: true,
  };

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
    controller = new CustomerController(mockCustomerService, mockAuthorizationService);
  });

  it("should create a customer with full data if user has permission", async () => {
    mockCustomerService.createCustomer.mockResolvedValueOnce(sampleCustomer);
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);

    const event = new H3Event(
      createRequest({ method: "POST", body: sampleCreateBody }),
    );

    event.context.claims = baseClaims;

    const response = await controller.postCreate(event);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(baseClaims, ["create:customer"]);

    expect(mockCustomerService.createCustomer).toHaveBeenCalledExactlyOnceWith(
      sampleCreateBody,
    );

    expect(response).toEqual({
      status: 201,
      statusText: "OK",
      message: "Created customer!",
      data: sampleCustomer,
    });
  });

  it("should throw when user does not have permission to create customer", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(false);

    const event = new H3Event(
      createRequest({ method: "POST", body: sampleCreateBody }),
    );

    const error = await controller.postCreate(event).catch((e) => e);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["create:customer"]);

    expect(mockCustomerService.createCustomer).not.toHaveBeenCalled();

    expect(error.cause).toEqual({
      status: 403,
      statusText: "Forbidden",
      message: "Forbidden",
      data: null,
    });
  })

  it("should create a customer with only name", async () => {
    const body = { name: "Jane Doe & Co" };
    const created = { id: 1, name: body.name, email: null, phone: null };
    mockCustomerService.createCustomer.mockResolvedValueOnce(created);
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);

    const event = new H3Event(createRequest({ method: "POST", body }));
    event.context.claims = baseClaims;

    const response = await controller.postCreate(event);

    expect(mockCustomerService.createCustomer).toHaveBeenCalledExactlyOnceWith(
      body,
    );
    expect(response).toEqual({
      status: 201,
      statusText: "OK",
      message: "Created customer!",
      data: created,
    });
  });

  it("should throw when no name is provided", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);

    const event = new H3Event(
      createRequest({
        method: "POST",
        body: { email: "a@b.com", phone: "123" },
      }),
    );

    event.context.claims = baseClaims;

    const error = await controller.postCreate(event).catch((e) => e);

    expect(error.cause).toEqual({
      status: 400,
      statusText: "Bad Request",
      message: "Bad Request",
      data: null,
    });
  });

  it("should return all customers if user has permission", async () => {
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
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.claims = baseClaims;

    const response = await controller.getAll(event);

    expect(mockCustomerService.allCustomers).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: all,
    });
  });

  it("should throw when user does not have permission to get all customers", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(false);

    const event = new H3Event(createRequest({ method: "GET" }));

    const error = await controller.getAll(event).catch((e) => e);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["read:customer"]);

    expect(mockCustomerService.allCustomers).not.toHaveBeenCalled();

    expect(error.cause).toEqual({
      status: 403,
      statusText: "Forbidden",
      message: "Forbidden",
      data: null,
    });
  });

  it("should get a customer by ID if user has permission", async () => {
    mockCustomerService.getCustomer.mockResolvedValueOnce(sampleCustomer);
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.params = { id: "1" };
    event.context.claims = baseClaims;

    const response = await controller.getOne(event);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["read:customer"]);

    expect(mockCustomerService.getCustomer).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleCustomer,
    });
  });

  it("should throw when user does not have permission to get a customer", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(false);

    const event = new H3Event(createRequest({ method: "GET" }));
    event.context.params = { id: "1" };

    const error = await controller.getOne(event).catch((e) => e);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["read:customer"]);

    expect(mockCustomerService.getCustomer).not.toHaveBeenCalled();

    expect(error.cause).toEqual({
      status: 403,
      statusText: "Forbidden",
      message: "Forbidden",
      data: null,
    });
  });

  it("should update a customer if customer has permission", async () => {
    mockCustomerService.updateCustomer.mockResolvedValueOnce(sampleCustomer);
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);

    const body = sampleCreateBody;
    const event = new H3Event(createRequest({ method: "PATCH", body }));
    event.context.params = { id: "1" };
    event.context.claims = baseClaims;

    const response = await controller.updateOne(event);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["update:customer"]);

    expect(mockCustomerService.updateCustomer).toHaveBeenCalledExactlyOnceWith(
      1,
      body,
    );
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleCustomer,
    });
  });

  it("should throw when user does not have permission to update a customer", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(false);

    const event = new H3Event(createRequest({ method: "PATCH" }));
    event.context.params = { id: "1" };

    const error = await controller.updateOne(event).catch((e) => e);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["update:customer"]);

    expect(mockCustomerService.updateCustomer).not.toHaveBeenCalled();

    expect(error.cause).toEqual({
      status: 403,
      statusText: "Forbidden",
      message: "Forbidden",
      data: null,
    });
  });

  it("should delete a customer if the user has permission", async () => {
    mockCustomerService.deleteCustomer.mockResolvedValueOnce(sampleCustomer);
    mockAuthorizationService.userCanDo.mockReturnValueOnce(true);

    const event = new H3Event(createRequest({ method: "DELETE" }));
    event.context.params = { id: "1" };
    event.context.claims = baseClaims;

    const response = await controller.deleteOne(event);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["delete:customer"]);

    expect(mockCustomerService.deleteCustomer).toHaveBeenCalledOnce();
    expect(response).toEqual({
      status: 200,
      statusText: "OK",
      message: "Success",
      data: sampleCustomer,
    });
  });

  it("should throw when user does not have permission to delete a customer", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(false);

    const event = new H3Event(createRequest({ method: "DELETE" }));
    event.context.params = { id: "1" };

    const error = await controller.deleteOne(event).catch((e) => e);

    expect(
      mockAuthorizationService.userCanDo,
    ).toHaveBeenCalledExactlyOnceWith(event.context.claims, ["delete:customer"]);

    expect(mockCustomerService.deleteCustomer).not.toHaveBeenCalled();

    expect(error.cause).toEqual({
      status: 403,
      statusText: "Forbidden",
      message: "Forbidden",
      data: null,
    });
  });
});
