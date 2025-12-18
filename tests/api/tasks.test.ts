import prisma from "@/lib/db"
import { POST as RegisterPOST } from "@/app/api/auth/register/route"
import { GET as TasksGET , POST as TaskPOST } from "@/app/api/tasks/route"
import { PUT as TaskPUT, DELETE as TaskDELETE } from "@/app/api/tasks/[id]/route"
import { signToken } from "@/lib/auth"

beforeEach(async () => {
  await prisma.tasks.deleteMany();
  await prisma.users.deleteMany();
});


async function createUserAndToken() {
    
    const registerUser = new Request("http://localhost/api/auth/register",{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({
            name: "Joao",
            email: "joao@exemplo.com",
            password: "senha1234"
        })
    })
    
    const registerResponse = await RegisterPOST(registerUser)
    const json = await registerResponse.json()
   
    const userId = json.data.user.id as number
    const token = signToken({userId})
    const authHeader = `Bearer ${token}`

    return { userId, authHeader }
    
}

describe("API / api/tasks", () => {
    test("POST deve criar uma tarefa com sucesso", async () => {
        const { userId, authHeader } = await createUserAndToken()
        const request = new Request("http://localhost/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify({
                title: "Minha tarefa",
                description: "Descricao da tarefa",
                status: "pending",
            }),
        })
        
        const response = await TaskPOST(request)
        const body = await response.json()

        expect(response.status).toBe(201)
        expect(body.success).toBe(true)
        expect(body.task).toHaveProperty("id")
        expect(body.task).toHaveProperty("title", "Minha tarefa")
        expect(body.task).toHaveProperty("user_id", userId)

       
    })

        test("GET deve listar apenas tarefas do usuario autenticado", async () => {
            const { userId, authHeader } = await createUserAndToken()

            await prisma.tasks.createMany({
                data: [
                    {
                        title: "Tarefa 1",
                        description: "",
                        status: "pending",
                        user_id: userId,
                    },
                    {
                        title: "Tarefa 2",
                        description: "",
                        status: "completed",
                        user_id: userId,
                    },
                ],
            });

            const request = new Request("http://localhost/api/tasks", {
                method: "GET",
                headers: { Authorization: authHeader },
            });
            const response = await TasksGET(request)
            const body = await response.json()

            expect(response.status).toBe(200)
            expect(body.success).toBe(true)
            expect(body.tasks).toHaveLength(2)
            expect(body.tasks[0]).toHaveProperty("user_id",userId)
        })
})

describe("API /api/tasks/[id]", () => {
  test("PUT deve atualizar tarefa do usuário", async () => {
    const { userId, authHeader } = await createUserAndToken();

    const task = await prisma.tasks.create({
      data: {
        title: "Old title",
        description: "",
        status: "pending",
        user_id: userId,
      },
    });

    const request = new Request(
      `http://localhost/api/tasks/${task.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          title: "New title",
          status: "completed",
        }),
      }
    );

    const response = await TaskPUT(request, {
      params: { id: String(task.id) },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.task).toHaveProperty("title", "New title");
    expect(body.task).toHaveProperty("status", "completed");
  });

  test("DELETE deve deletar tarefa do usuário", async () => {
    const { userId, authHeader } = await createUserAndToken();

    const task = await prisma.tasks.create({
      data: {
        title: "Delete me",
        description: "",
        status: "pending",
        user_id: userId,
      },
    });

    const request = new Request(
      `http://localhost/api/tasks/${task.id}`,
      {
        method: "DELETE",
        headers: { Authorization: authHeader },
      }
    );

    const response = await TaskDELETE(request, {
      params: { id: String(task.id) },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);

    const stillExists = await prisma.tasks.findUnique({
      where: { id: task.id },
    });
    expect(stillExists).toBeNull();
  });
});
