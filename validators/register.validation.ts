import { z } from "zod";

export const validation = z.object({
  email: z.email("Format not valid").toLowerCase().trim(),

  password: z.string().min(8, "password must be of at least 8 characters"),
});
