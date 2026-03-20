import { create } from 'zustand';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import type { User } from '@workspace/api-client-react';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('nutterx_token') : null,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('nutterx_token', token);
    } else {
      localStorage.removeItem('nutterx_token');
    }
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('nutterx_token');
    set({ token: null });
    window.location.href = '/auth';
  }
}));

export function useAuth() {
  const { token, setToken, logout } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Only run the query if we have a token
  const { data: user, isLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  // Automatically logout on 401
  if (error && (error as any).status === 401) {
    logout();
  }

  const login = (newToken: string) => {
    setToken(newToken);
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  return {
    user: user as User | undefined,
    isAuthenticated: !!token && !!user,
    isLoading: isLoading && !!token,
    login,
    logout
  };
}
