import z from "zod";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export type TaskFormData = z.infer<typeof taskSchema>;
