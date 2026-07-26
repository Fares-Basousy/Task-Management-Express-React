import { describe, it, expect, vi, beforeEach } from "vitest";
import { http } from "../../src/api/http";
import { registerRequest, loginRequest, logoutRequest } from "../../src/api/authService";

vi.mock("../../src/api/http", () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    postForm: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registerRequest posts to /auth/signup with the signup payload", async () => {
    vi.mocked(http.post).mockResolvedValue({ message: "User created successfully", data: undefined });

    await registerRequest({ name: "Ada", email: "ada@example.com", password: "secret1" });

    expect(http.post).toHaveBeenCalledWith("/auth/signup", {
      name: "Ada",
      email: "ada@example.com",
      password: "secret1",
    });
  });

  it("loginRequest posts to /auth/login and resolves the user/token envelope", async () => {
    const envelope = {
      message: "Login successful",
      data: { user: { id: "1", name: "Ada", email: "ada@example.com" }, token: "signed-token" },
    };
    vi.mocked(http.post).mockResolvedValue(envelope);

    const result = await loginRequest({ email: "ada@example.com", password: "secret1" });

    expect(http.post).toHaveBeenCalledWith("/auth/login", { email: "ada@example.com", password: "secret1" });
    expect(result).toEqual(envelope);
  });

  it("logoutRequest never throws even when the request fails", async () => {
    vi.mocked(http.post).mockRejectedValue(new Error("network down"));

    await expect(logoutRequest()).resolves.toBeUndefined();
  });
});
