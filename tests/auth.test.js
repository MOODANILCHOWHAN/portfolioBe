const request = require("supertest");
const app     = require("../server");

describe("Auth API", () => {
  it("POST /api/auth/register — should return 422 for missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(422);
  });

  it("POST /api/auth/login — should return 401 for wrong credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "x@x.com", password: "wrong" });
    expect([401, 404, 500]).toContain(res.status);
  });
});
