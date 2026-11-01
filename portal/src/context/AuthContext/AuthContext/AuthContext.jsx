import {
  createContext,
  useState,
  useMemo,
  useContext,
  useCallback,
} from "react";

export const AuthContext = createContext(null);

const USER_KEY = "digiamplify_user";
const TOKEN_KEY = "digiamplify_token";

/**
 * Access authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

/**
 * Normalize user role and validate user data.
 */
const normalizeUser = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  const role = String(user.role || "").trim().toLowerCase();

  if (!["admin", "employee"].includes(role)) {
    return null;
  }

  return {
    ...user,
    role,
  };
};

/**
 * Initialize authentication from saved browser data.
 */
const initializeAuth = () => {
  try {
    const savedUser = JSON.parse(
      localStorage.getItem(USER_KEY) || "null"
    );

    const token = localStorage.getItem(TOKEN_KEY);
    const user = normalizeUser(savedUser);

    if (!token || !user) {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);

      return {
        user: null,
        token: null,
        isAuthenticated: false,
      };
    }

    return {
      user,
      token,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error("Unable to initialize authentication:", error);

    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

/**
 * Authentication provider.
 */
export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initializeAuth);

  /**
   * Login user using the real backend access token.
   */
  const login = useCallback((userData) => {
    const user = normalizeUser(userData);
    const token = userData?.token || userData?.accessToken;

    if (!user) {
      throw new Error("Invalid user data or role.");
    }

    if (!token || typeof token !== "string") {
      throw new Error("Authentication token is missing.");
    }

    // Remove old or conflicting authentication values.
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(TOKEN_KEY);

    // Keep the token separate from the user profile.
    const { token: ignoredToken, accessToken: ignoredAccessToken, ...userProfile } =
      user;

    // Save the authenticated user and real access token.
    localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
    localStorage.setItem(TOKEN_KEY, token);

    setAuthState({
      user: userProfile,
      token,
      isAuthenticated: true,
    });

    return userProfile;
  }, []);

  /**
   * Logout user and clear local authentication data.
   *
   * This function clears the local session. The caller should also
   * call the backend logout endpoint to revoke the refresh token.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");

    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("token");

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  }, []);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: authState.isAuthenticated,
      login,
      logout,
    }),
    [authState, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;