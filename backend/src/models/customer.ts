import { z } from "zod/v4";

export const CreateCustomerDtoSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerDtoSchema>;

export const UpdateCustomerDtoSchema = CreateCustomerDtoSchema;
export type UpdateCustomerDto = z.infer<typeof UpdateCustomerDtoSchema>;
