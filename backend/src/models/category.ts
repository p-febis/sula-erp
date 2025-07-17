import { z } from "zod/v4";

export const CreateCategoryDtoSchema = z.object({
  name: z.string(),
  parentId: z.number().optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategoryDtoSchema>;
