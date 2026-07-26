import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { AuthController } from "./auth.controller";
import type { AuthService } from "@/services/auth.service";

function createMockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const next = vi.fn() as unknown as NextFunction;

describe("AuthController.signup", () => {
  it("forwards email/name/password and sends the service's status/body", async () => {
    const service = {
      signup: vi.fn().mockResolvedValue({ status: 201, message: "User created successfully" }),
      login: vi.fn(),
    } as unknown as AuthService;
    const controller = new AuthController(service);
    const req = { body: { email: "ada@example.com", name: "Ada", password: "secret1" } } as Request;
    const res = createMockRes();

    await controller.signup(req, res, next);

    expect(service.signup).toHaveBeenCalledWith("ada@example.com", "Ada", "secret1");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "User created successfully" });
  });
});

describe("AuthController.login", () => {
  it("forwards email/password and sends the service's status/body", async () => {
    const service = {
      signup: vi.fn(),
      login: vi.fn().mockResolvedValue({
        status: 200,
        message: "Login successful",
        data: { user: { id: "1" }, token: "signed-token" },
      }),
    } as unknown as AuthService;
    const controller = new AuthController(service);
    const req = { body: { email: "ada@example.com", password: "secret1" } } as Request;
    const res = createMockRes();

    await controller.login(req, res, next);

    expect(service.login).toHaveBeenCalledWith("ada@example.com", "secret1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      data: { user: { id: "1" }, token: "signed-token" },
    });
  });
});
