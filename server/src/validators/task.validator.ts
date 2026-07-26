import { z } from "zod";

export const VerifyCreateTask = z.object({
  name: z.string().min(1, "Task name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  priority: z.number().min(1).max(3).optional(),
  status: z.number().min(1).max(3).optional(),
  dueDate: z.number().optional(),
});

export const VerifyUpdateTask = z.object({
  id: z.string(),

  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  priority: z.number().min(1).max(3).optional(),
  status: z.number().min(1).max(3).optional(),
  dueDate: z.number().optional(),
});
