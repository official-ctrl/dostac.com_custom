import { createContext, useContext, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAdminGetMe,
  useAdminLogout,
  getAdminGetMeQueryKey,
  type AdminUser,
} from "@workspace/api-client-react";

type AuthContextValue = {
  user: AdminUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading, isFetching } = useAdminGetMe({
    query: {
      queryKey: getAdminGetMeQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });
  const logoutMut = useAdminLogout();

  const logout = async () => {
    try {
      await logoutMut.mutateAsync();
    } finally {
      qc.setQueryData(getAdminGetMeQueryKey(), null);
      qc.clear();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: (data ?? null) as AdminUser | null,
        isLoading: isLoading || isFetching,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
