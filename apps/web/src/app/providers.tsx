"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode, useEffect } from "react";
import { apiClient } from "@gonggu/shared/utils/api-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Reduced staleTime to 30 seconds to avoid stale 401 cache
            staleTime: 1000 * 30,
            retry: 2,
            // Refetch on window focus to recover from cached errors
            refetchOnWindowFocus: true,
            // Don't refetch on reconnect if we just fixed the token
            refetchOnReconnect: "always",
          },
        },
      })
  );

  // Initialize admin token from localStorage SYNCHRONOUSLY on client side
  // Must run before any queries fire, so do it in component body (not useEffect)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("gonggu.adminToken");
    if (token) {
      apiClient.setAdminToken(token);
    }
  }

  // Also listen for storage changes (e.g., login in another tab)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "gonggu.adminToken" && e.newValue) {
        apiClient.setAdminToken(e.newValue);
        queryClient.invalidateQueries({ queryKey: ["admin"] });
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}