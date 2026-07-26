import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "./authMiddleware";

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

function createMockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("requireAuth", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    vi.clearAllMocks();
  });

  it("rejects with 401 when there is no Authorization header", () => {
    const req = { headers: {} } as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized user." });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects with 401 when the token fails verification", () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error("bad token");
    });
    const req = { headers: { authorization: "Bearer bad-token" } } as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token." });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the decoded payload to req.user and calls next() for a valid token", () => {
    vi.mocked(jwt.verify).mockReturnValue({ userId: "user-1", role: "user" } as never);
    const req = { headers: { authorization: "Bearer good-token" } } as Request;
    const res = createMockRes();
    const next = vi.fn() as unknown as NextFunction;

    requireAuth(req, res, next);

    expect(req.user).toEqual({ userId: "user-1", role: "user" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
