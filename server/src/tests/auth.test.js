import request from "supertest";
import server from "../../server"; // adjust if your server.js path differs

describe("Auth Routes", () => {
  afterAll(() => server.close());

  test(
    "should sign up a new user",
    async () => {
      const res = await request(server)
        .post("/api/v1/auth/register")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("accessToken"); // your API returns accessToken
    },
    10000 // increase timeout for slow DB startup
  );

  test("should login user", async () => {
    const res = await request(server)
      .post("/api/v1/auth/login")
      .send({
        email: "test@example.com",
        password: "password123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("accessToken"); // changed from token → accessToken
  });
});
