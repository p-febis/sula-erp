import { z } from "zod/v4";

export const CreateCustomerDtoSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
});

export type CreateCustomerDto = z.infer<typeof CreateCustomerDtoSchema>;
