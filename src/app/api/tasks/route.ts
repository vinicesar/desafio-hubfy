import { NextResponse } from "next/server";
import z from "zod";
import { prisma } from "@/lib/db";
import { getUserIdFromAuthHeader } from "@/lib/auth";

const CreateTaskSchema = z.object({
  title: z.string().min(1, "Título não pode ser vazio").optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromAuthHeader(authHeader);

    const tasks = await prisma.tasks.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(
      {
        tasks,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro ao buscar tarefas.",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromAuthHeader(authHeader);

    const body = await req.json();
    const parsed = CreateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors,
          success: false,
        },
        { status: 400 }
      );
    }

    const { title, description, status } = parsed.data;

    const task = await prisma.tasks.create({
      data: {
        title: title!,
        description: description || "",
        status: status,
        user_id: userId,
      },
    });

    return NextResponse.json(
      {
        task,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro ao criar tarefa.",
        success: false,
      },
      { status: 500 }
    );
  }
}
