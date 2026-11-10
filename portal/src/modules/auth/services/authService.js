import axios from "axios";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

// Public signup. The account stays "pending" until an admin approves it.
export const register = async ({ name, email, password, pin }) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/register`,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        pin,
      },
      {
        withCredentials: true,
      }
    );

    return response.data?.data ?? response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, "Unable to create account. Please try again.")
    );
  }
};

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
    throw new Error(getErrorMessage(error, "Login failed. Please try again."));
  }
};