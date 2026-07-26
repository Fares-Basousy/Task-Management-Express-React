import { describe, it, expect } from "vitest";
import { VerifySignup, VerifySignin } from "./auth.validator";

describe("VerifySignup", () => {
  it("accepts valid signup details", () => {
    const result = VerifySignup.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "secret1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = VerifySignup.safeParse({
      name: "Ada",
      email: "not-an-email",
      password: "secret1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = VerifySignup.safeParse({
      name: "",
      email: "ada@example.com",
      password: "secret1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = VerifySignup.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("VerifySignin", () => {
  it("accepts a valid email/password pair", () => {
    const result = VerifySignin.safeParse({ email: "ada@example.com", password: "secret1" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = VerifySignin.safeParse({ email: "ada@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects an email over 45 characters", () => {
    const longEmail = `${"a".repeat(40)}@example.com`;
    const result = VerifySignin.safeParse({ email: longEmail, password: "secret1" });
    expect(result.success).toBe(false);
  });
});
