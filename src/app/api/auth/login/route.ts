import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { comparePasswords, signToken } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors, success: false },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { message: "Email ou senha inválidos.", success: false },
        { status: 401 }
      );
    }

    const valid = await comparePasswords(password, user.password);

    if (!valid) {
      return NextResponse.json(
        { message: "Email ou senha inválidos.", success: false },
        { status: 401 }
      );
    }
    const token = signToken({ userId: user.id });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Erro interno do servidor.", success: false },
      { status: 500 }
    );
  }
}
