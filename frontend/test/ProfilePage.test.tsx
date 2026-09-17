import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../src/pages/Profile/ProfilePage";
import authService from "../src/services/authService";

let mockCurrentUser: any = null;

vi.mock("../src/context/useAuth", () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    updateUser: vi.fn(),
  }),
}));

vi.mock("../src/services/authService", () => ({
  default: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

describe("Frontend ProfilePage Security & Password Management Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should hide password change fields and show Google security notice when user logged in via Google", async () => {
    mockCurrentUser = {
      _id: "google_user_1",
      username: "Alok Google",
      email: "alok@gmail.com",
      authProvider: "google",
      googleId: "google_sub_12345",
    };

    (authService.getProfile as any).mockResolvedValueOnce({
      data: mockCurrentUser,
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Password Managed by Google/i)).toBeDefined();
    });

    expect(screen.getByText(/Personal Information/i)).toBeDefined();
    expect(screen.getByText(/Google Account/i)).toBeDefined();
    expect(screen.queryByText(/Manage Google Security Settings/i)).toBeNull();

    // Password input fields MUST NOT be present
    expect(screen.queryByPlaceholderText(/Enter current password/i)).toBeNull();
    expect(screen.queryByPlaceholderText(/Enter new password/i)).toBeNull();
    expect(screen.queryByPlaceholderText(/Confirm new password/i)).toBeNull();
  });

  it("should display change password form when user is authenticated with email & password", async () => {
    mockCurrentUser = {
      _id: "local_user_1",
      username: "Alok Local",
      email: "alok@test.com",
      authProvider: "local",
    };

    (authService.getProfile as any).mockResolvedValueOnce({
      data: mockCurrentUser,
    });

    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Change Password/i).length).toBeGreaterThan(0);
    });

    // Password form fields MUST be present
    expect(screen.getByPlaceholderText(/Enter current password/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Enter new password/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/Confirm new password/i)).toBeDefined();
  });
});
