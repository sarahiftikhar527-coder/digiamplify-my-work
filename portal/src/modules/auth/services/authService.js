import axios from "axios";

const API_URL = "http://localhost:5000/api/v1";

export const login = async ({ email, password }) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      {
        email: email.trim().toLowerCase(),
        password,
      },
      {
        withCredentials: true,
      }
    );

    const result = response.data?.data ?? response.data;
    const user = result?.user;
    const token = result?.accessToken;

    if (!user || !token) {
      throw new Error("Invalid login response from server.");
    }

    const role = String(user.role || "").trim().toLowerCase();

    if (!["admin", "employee"].includes(role)) {
      throw new Error("Your account does not have portal access.");
    }

    return {
      user: { ...user, role },
      token,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Login failed. Please try again.";

    throw new Error(message);
  }
};