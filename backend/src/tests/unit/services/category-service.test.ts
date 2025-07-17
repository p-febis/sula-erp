import { beforeEach, describe, expect, it, vi } from "vitest";
import { CategoryService, ICategoryService } from "@/services/CategoryService";

const mockCategoryRepository = {
  create: vi.fn(),
};

describe("CategoryService", () => {
  let service: ICategoryService;

  const categoryData = {
    id: 1,
    name: "Drinks",
    parentId: null,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    service = new CategoryService(mockCategoryRepository);
  });

  it("should create a category", async () => {
    mockCategoryRepository.create.mockResolvedValueOnce(categoryData);

    const result = await service.createCategory({
      name: "Drinks",
    });
    expect(mockCategoryRepository.create).toHaveBeenCalledExactlyOnceWith({
      name: "Drinks",
    });

    expect(result).toEqual(categoryData);
  });
});
