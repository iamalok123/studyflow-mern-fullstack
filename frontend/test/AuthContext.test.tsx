import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext";
import { useAuth } from "../src/context/useAuth";

const TestConsumerComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? "authenticated" : "guest"}</span>
      <span data-testid="username">{user?.username || "no-user"}</span>
      <button
        data-testid="login-btn"
        onClick={() =>
          login(
            {
              _id: "u123",
              username: "student1",
              email: "student@test.com",
            } as any,
            "mock_token_jwt"
          )
        }
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe("Frontend AuthContext Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize as guest when localStorage has no credentials", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestConsumerComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId("auth-status").textContent).toBe("guest");
    expect(screen.getByTestId("username").textContent).toBe("no-user");
  });

  it("should update state and localStorage upon login call", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestConsumerComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    act(() => {
      screen.getByTestId("login-btn").click();
    });

    expect(screen.getByTestId("auth-status").textContent).toBe("authenticated");
    expect(screen.getByTestId("username").textContent).toBe("student1");
    expect(localStorage.getItem("token")).toBe("mock_token_jwt");
  });

  it("should clear state and localStorage upon logout call", () => {
    localStorage.setItem("token", "active_jwt");
    localStorage.setItem("user", JSON.stringify({ _id: "u1", username: "existing" }));

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestConsumerComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId("username").textContent).toBe("existing");

    act(() => {
      screen.getByTestId("logout-btn").click();
    });

    expect(screen.getByTestId("auth-status").textContent).toBe("guest");
    expect(localStorage.getItem("token")).toBeNull();
  });
});
