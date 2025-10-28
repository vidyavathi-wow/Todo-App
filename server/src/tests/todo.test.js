// src/tests/todo.test.js
const request=require("supertest")
const app=require("../app")

describe("Todo Routes", () => {
  let server;
  let token;

  beforeAll(async () => {
    server = app.listen(0);

    await request(server).post("/api/v1/auth/register").send({
      name: "Tester",
      email: "todo@example.com",
      password: "123456",
    });
    const login = await request(server)
      .post("/api/v1/auth/login")
      .send({ email: "todo@example.com", password: "123456" });
    token = login.body.token;
  });

  afterAll((done) => server.close(done));

  test("should createa new todo", async () => {
    const res = await request(server)
      .post("/api/v1/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Todo",
        description: "Learn Jest testing",
        status: "Not Started",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.todo.title).toBe("Test Todo");
  });
});
