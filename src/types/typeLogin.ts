import z from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email deve ser valido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
})

export type loginTypeInitialValue = z.input<typeof loginSchema>

export type loginTypeResultValue = z.infer<typeof loginSchema>

