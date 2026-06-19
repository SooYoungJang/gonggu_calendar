"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
const TOKEN_KEY = "gonggu.authToken";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 초기 로드: localStorage에서 토큰 복원
  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      // 토큰에서 payload 추출 (JWT decode)
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        setUser({
          id: payload.sub ?? "admin",
          email: payload.email ?? "admin@gonggu.app",
          role: payload.role ?? "admin",
        });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "로그인에 실패했습니다.");
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message ?? "로그인에 실패했습니다.");
      } catch {
        throw new Error(errorText || "로그인에 실패했습니다.");
      }
    }

    const data = await response.json();
    const accessToken: string = data.accessToken;

    // localStorage에 저장
    localStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(data.user ?? { id: "admin", email, role: "admin" });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    router.push("/admin/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}