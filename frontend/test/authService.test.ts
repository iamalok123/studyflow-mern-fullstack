import { describe, it, expect, vi, beforeEach } from "vitest";
import authService from "../src/services/authService";
import axiosInstance from "../src/utils/axiosInstance";

vi.mock("../src/utils/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("Frontend AuthService Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully log in user and return response data", async () => {
    const mockData = {
      success: true,
      data: { token: "fake_token_jwt", user: { id: "u1", email: "test@example.com" } },
    };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockData });

    const result = await authService.login("test@example.com", "password123");
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/auth/login", {
      email: "test@example.com",
      password: "password123",
    });
    expect(result).toEqual(mockData);
  });

  it("should successfully register user and return response data", async () => {
    const mockData = {
      success: true,
      data: { user: { id: "u2", username: "learner", email: "learner@test.com" } },
    };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockData });

    const result = await authService.register("learner", "learner@test.com", "password123");
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/auth/register", {
      username: "learner",
      email: "learner@test.com",
      password: "password123",
    });
    expect(result).toEqual(mockData);
  });

  it("should successfully perform Google login with credentials", async () => {
    const mockData = { success: true, data: { token: "google_token" } };
    (axiosInstance.post as any).mockResolvedValueOnce({ data: mockData });

    const result = await authService.googleLogin("credential_id_token");
    expect(axiosInstance.post).toHaveBeenCalledWith("/api/auth/google", {
      credential: "credential_id_token",
    });
    expect(result).toEqual(mockData);
  });

  it("should fetch user profile", async () => {
    const mockProfile = { success: true, data: { username: "alok", email: "alok@test.com" } };
    (axiosInstance.get as any).mockResolvedValueOnce({ data: mockProfile });

    const result = await authService.getProfile();
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/auth/profile");
    expect(result).toEqual(mockProfile);
  });

  it("should throw error response data when API call fails", async () => {
    (axiosInstance.post as any).mockRejectedValueOnce({
      response: { data: { success: false, error: "Invalid credentials" } },
    });

    await expect(authService.login("test@test.com", "wrongpass")).rejects.toEqual({
      success: false,
      error: "Invalid credentials",
    });
  });
});
