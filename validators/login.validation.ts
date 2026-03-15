import { z } from "zod";

export const loginValidation = z.object({
  email: z.email().toLowerCase().trim(),
  password: z.string().min(8, "password must be of least 8 characters"),
});
