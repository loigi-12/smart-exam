import { create } from "zustand";

interface AuthState {
  user: any;
  setUser: (user: any) => void;
  clearUser: () => void;
}

const localStorageKey = import.meta.env.VITE_LOCAL_STORAGE_KEY;

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem(localStorageKey) || "null"),
  setUser: (user) => {
    set({ user });
  },
  clearUser: () => {
    localStorage.removeItem(localStorageKey);
    set({ user: null });
  },
}));
