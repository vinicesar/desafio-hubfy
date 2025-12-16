import { NextResponse } from "next/server";
import z from "zod";
import { prisma } from "@/lib/db";
import { getUserIdFromAuthHeader } from "@/lib/auth";

const updateTaskSchema = z.object({
  title: z.string().min(1, "Título não pode ser vazio").optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export async function GetTasks(req: Request) {
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
