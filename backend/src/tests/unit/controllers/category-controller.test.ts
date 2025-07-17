import { beforeEach, describe, expect, it, vi } from "vitest";
import { ICategoryController, CategoryController } from "@/controllers/CategoryController";
import { createRequest } from "node-mocks-http";
import { H3Event } from "h3";

vi.mock("@/utils/body-parser", () => ({
  parseBodyAsync: async (event: H3Event) => event.req.body,
}));

describe("CategoryController", () => {
  let controller: ICategoryController;

  const mockCategoryService = {
    createCategory: vi.fn()
  }

  const mockAuthorizationService = {
    userCanDo: vi.fn(),
  };

  const baseClaims = {
    is_super_user: true,
  };

  const sampleCategory = {
    id: 1,
    name: "Drinks",
    parentId: null,
  }

  const sampleCreateBody = {
    name: "Drinks",
  }

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new CategoryController(
      mockCategoryService,
      mockAuthorizationService,
    );
  });

  it("should create a category if user has permission", async () => {
    mockCategoryService.createCategory.mockResolvedValueOnce(sampleCategory);
    mockAuthorizationService.userCanDo.mockReturnValue(true);

    const event = new H3Event(
      createRequest({ method: "POST", body: sampleCreateBody }),
    );
    event.context.claims = baseClaims;

    const response = await controller.postCreate(event);

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      baseClaims,
      ["create:category"],
    );

    expect(mockCategoryService.createCategory).toHaveBeenCalledWith(sampleCreateBody);

    expect(response).toEqual({
      status: 201,
      statusText: "OK",
      message: "Created category!",
      data: sampleCategory,
    });
  })

  it("should throw on create if user doesn't have permission", async () => {
    mockAuthorizationService.userCanDo.mockReturnValueOnce(false);
    const event = new H3Event(
      createRequest({ method: "POST", body: sampleCreateBody }),
    );

    const error = await controller.postCreate(event).catch((e) => e);

    expect(mockAuthorizationService.userCanDo).toHaveBeenCalledExactlyOnceWith(
      event.context.claims,
      ["create:category"],
    );
    expect(mockCategoryService.createCategory).not.toHaveBeenCalled();

    expect(error.cause).toEqual({
      status: 403,
      statusText: "Forbidden",
      message: "Forbidden",
      data: null,
    });
  })
})
