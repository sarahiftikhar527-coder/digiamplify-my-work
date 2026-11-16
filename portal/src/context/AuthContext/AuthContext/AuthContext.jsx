
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

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") {
    return null;
  }

  const role = String(user.role || "").trim().toLowerCase();

  if (!["admin", "superadmin", "employee"].includes(role)) {
    return null;
  }

  return {
    ...user,
    role,
  };
};

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

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initializeAuth);

  const login = useCallback((userData) => {
    const user = normalizeUser(userData);
    const token = userData?.token || userData?.accessToken;

    if (!user) {
      throw new Error("Invalid user data or role.");
    }

    if (!token || typeof token !== "string") {
      throw new Error("Authentication token is missing.");
    }

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem(TOKEN_KEY);

    const {
      token: ignoredToken,
      accessToken: ignoredAccessToken,
      ...userProfile
    } = user;

    localStorage.setItem(USER_KEY, JSON.stringify(userProfile));
    localStorage.setItem(TOKEN_KEY, token);

    setAuthState({
      user: userProfile,
      token,
      isAuthenticated: true,
    });

    return userProfile;
  }, []);

  const updateUser = useCallback((updatedData) => {
    if (!updatedData || typeof updatedData !== "object") {
      return;
    }

    setAuthState((previous) => {
      if (!previous.user) {
        return previous;
      }

      const updatedUser = normalizeUser({
        ...previous.user,
        ...updatedData,
        role: previous.user.role,
      });

      if (!updatedUser) {
        return previous;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      return {
        ...previous,
        user: updatedUser,
      };
    });
  }, []);

  const updateAvatar = useCallback((avatarUrl) => {
    if (typeof avatarUrl !== "string") {
      return;
    }

    updateUser({
      avatarUrl,
      avatar: avatarUrl,
    });
  }, [updateUser]);

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
      updateUser,
      updateAvatar,
    }),
    [authState, login, logout, updateUser, updateAvatar]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
