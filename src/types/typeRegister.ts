import z from "zod";


export const registerUserSchema = z .object({
    name: z.string().min(1, "O nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type registerUserInitialValue = z.input<typeof registerUserSchema>

export type registerUserResultValue = z.infer<typeof registerUserSchema>
