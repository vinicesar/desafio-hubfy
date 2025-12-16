import { getUserIdFromAuthHeader } from "@/lib/auth";
import { NextResponse } from "next/server";
import z from "zod";

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromAuthHeader(authHeader);

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors,
          success: false,
        },
        { status: 400 }
      );
    }

    const task = await prisma?.tasks.findUnique({
      where: { id: Number(params.id) },
    });

    if (!task || task.user_id !== userId) {
      return NextResponse.json(
        {
          message: "Tarefa não encontrada ou acesso negado.",
          success: false,
        },
        { status: 404 }
      );
    }

    const updatedTask = await prisma?.tasks.update({
      where: { id: Number(params.id) },
      data: parsed.data,
    });

    return NextResponse.json(
      {
        task: updatedTask,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno do servidor.",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = req.headers.get("Authorization");
    const userId = getUserIdFromAuthHeader(authHeader);

    const task = await prisma?.tasks.findUnique({
      where: { id: Number(params.id) },
    });

    if (!task || task.user_id !== userId) {
      return NextResponse.json(
        {
          message: "Tarefa não encontrada ou acesso negado.",
          success: false,
        },
        { status: 404 }
      );
    }
    await prisma?.tasks.delete({ where: { id: Number(params.id) } });

    return NextResponse.json(
      {
        message: "Tarefa deletada com sucesso.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Erro interno do servidor.",
        success: false,
      },
      { status: 500 }
    );
  }
}
