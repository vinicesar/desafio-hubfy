import prisma from "../../src/lib/db";
import { POST as RegisterPOST } from "@/app/api/auth/register/route";
import { POST as LoginPOST } from "@/app/api/auth/login/route";
import { hashPassword } from "@/lib/auth";

describe("POST /api/auth/register", () => {

  test("deve registrar um usuario com sucesso", async () => {
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Maria",
        email: "maria@exemplo.com",
        password: "senha1234", 
      }),
    });

    const response = await RegisterPOST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.success).toBe(true);
    expect(data.data.user).toHaveProperty("id");
    expect(data.data.user).toHaveProperty("email", "maria@exemplo.com");
    expect(data.data.user).not.toHaveProperty("password");
  });


});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const senhaHashed = await hashPassword("senha1234")
    await prisma.users.create({
      data: {
        name: "Joana",
        email: "Joana@gmail.com",
        password: senhaHashed,
      },
    });
  });
  
  test("deve logar um usuario com sucesso", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "Joana@gmail.com",
        password: "senha1234",
      }),
    });

    const response = await LoginPOST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
    expect(data.user).toHaveProperty("id");
    expect(data.user).toHaveProperty("email", "Joana@gmail.com");
    expect(data.user).not.toHaveProperty("password");
  });

});
