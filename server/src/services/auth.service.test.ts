import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { AuthService } from "./auth.service";

vi.mock("../models/user.model", () => {
  const ctor = vi.fn();
  (ctor as any).findOne = vi.fn();
  return { default: ctor };
});

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

const mockedUser = User as unknown as ReturnType<typeof vi.fn> & {
  findOne: ReturnType<typeof vi.fn>;
};

describe("AuthService.signup", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    vi.clearAllMocks();
  });

  it("rejects invalid input before touching the database", async () => {
    const result = await service.signup("not-an-email", "Ada", "secret1");

    expect(result.status).toBe(400);
    expect(mockedUser.findOne).not.toHaveBeenCalled();
  });

  it("returns 409 when the email is already registered", async () => {
    mockedUser.findOne.mockResolvedValue({ email: "ada@example.com" });

    const result = await service.signup("ada@example.com", "Ada", "secret1");

    expect(result).toEqual({ status: 409, message: "User already exists." });
  });

  it("lowercases the email, hashes the password, and saves a new user", async () => {
    mockedUser.findOne.mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    const save = vi.fn().mockResolvedValue(undefined);
    mockedUser.mockImplementation(() => ({ save } as any));

    const result = await service.signup("Ada@Example.com", "Ada", "secret1");

    expect(bcrypt.hash).toHaveBeenCalledWith("secret1", 10);
    expect(mockedUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Ada",
        email: "ada@example.com",
        password: "hashed-password",
      })
    );
    expect(save).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 201, message: "User created successfully" });
  });

  it("returns 500 with the error message on unexpected failures", async () => {
    mockedUser.findOne.mockRejectedValue(new Error("db down"));

    const result = await service.signup("ada@example.com", "Ada", "secret1");

    expect(result).toEqual({ status: 500, message: "db down" });
  });
});

describe("AuthService.login", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    process.env.JWT_SECRET = "test-secret";
    vi.clearAllMocks();
  });

  it("rejects invalid input", async () => {
    const result = await service.login("not-an-email", "secret1");
    expect(result.status).toBe(400);
  });

  it("returns 401 when no user is found for the email", async () => {
    mockedUser.findOne.mockResolvedValue(null);

    const result = await service.login("ada@example.com", "secret1");

    expect(result).toEqual({ status: 401, message: "Invalid credentials" });
  });

  it("returns 401 when the password does not match", async () => {
    mockedUser.findOne.mockResolvedValue({ password: "hashed" });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const result = await service.login("ada@example.com", "wrong-password");

    expect(result).toEqual({ status: 401, message: "Invalid credentials" });
  });

  it("returns a token and the public user fields on success, without the password", async () => {
    mockedUser.findOne.mockResolvedValue({
      id: "user-1",
      _id: { toString: () => "user-1" },
      email: "ada@example.com",
      name: "Ada",
      password: "hashed",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue("signed-token" as never);

    const result = await service.login("ada@example.com", "secret1");

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: "user-1" },
      "test-secret",
      expect.objectContaining({ expiresIn: expect.anything() })
    );
    // toEqual is a strict structural match, so this also confirms the
    // password hash never rides along in the response.
    expect(result).toEqual({
      status: 200,
      message: "Login successful",
      data: {
        user: { id: "user-1", email: "ada@example.com", name: "Ada" },
        token: "signed-token",
      },
    });
  });
});
