import { NextResponse } from "next/server";
import z, { date, success } from "zod";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const registerSchema = z.object({
  userName: z.string().min(1, "O nome de usuário é obrigatório."),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export async function registerUser(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { data: { error: parsed.error.flatten().fieldErrors }, success: false },
        { status: 400 }
      );
    }
    const { userName, email, password } = parsed.data;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { data: { message: "Email já cadastrado.", success: false } },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.users.create({
      data: { name: userName, email, password: hashedPassword },
      select: { id: true, name: true, email: true, created_at: true },
    });

    return NextResponse.json(
      { data: { user: newUser, success: true } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { data: { message: "Erro interno do servidor.", success: false } },
      { status: 500 }
    );
  }
}
