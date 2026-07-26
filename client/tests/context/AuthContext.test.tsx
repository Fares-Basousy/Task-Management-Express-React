import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "../../src/context/AuthContext";
import * as authService from "../../src/api/authService";

vi.mock("../../src/api/authService");

function TestConsumer() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.name : "none"}</span>
      <span data-testid="authed">{String(isAuthenticated)}</span>
      <button onClick={() => login({ email: "ada@example.com", password: "secret1" })}>login</button>
      <button onClick={() => register({ name: "Ada", email: "ada@example.com", password: "secret1" })}>
        register
      </button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("starts unauthenticated when there is no stored session", () => {
    renderWithProvider();
    expect(screen.getByTestId("authed")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("login persists the session and updates state", async () => {
    vi.mocked(authService.loginRequest).mockResolvedValue({
      message: "Login successful",
      data: { user: { id: "1", name: "Ada", email: "ada@example.com" }, token: "signed-token" },
    });
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("true"));
    expect(screen.getByTestId("user")).toHaveTextContent("Ada");
    expect(sessionStorage.getItem("tm_access_token")).toBe("signed-token");
  });

  // Regression: signup must NOT log the user in — it only creates the
  // account; the app then routes them to /login to sign in themselves.
  it("register does not persist a session", async () => {
    vi.mocked(authService.registerRequest).mockResolvedValue({
      message: "User created successfully",
      data: undefined,
    });
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("register"));

    await waitFor(() => expect(authService.registerRequest).toHaveBeenCalled());
    expect(screen.getByTestId("authed")).toHaveTextContent("false");
    expect(sessionStorage.getItem("tm_access_token")).toBeNull();
  });

  it("logout clears the stored session", async () => {
    vi.mocked(authService.loginRequest).mockResolvedValue({
      message: "Login successful",
      data: { user: { id: "1", name: "Ada", email: "ada@example.com" }, token: "signed-token" },
    });
    vi.mocked(authService.logoutRequest).mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("true"));

    await user.click(screen.getByText("logout"));

    await waitFor(() => expect(screen.getByTestId("authed")).toHaveTextContent("false"));
    expect(sessionStorage.getItem("tm_access_token")).toBeNull();
  });
});
