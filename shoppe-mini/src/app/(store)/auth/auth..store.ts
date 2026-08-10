import { create } from "zustand";

export interface User {
    id: number;
    email: string;
    fullName: string;
    phone?: string | null;
    avatar?: string | null;
    role: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;

    setUser: (user: User) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    setUser: (user) =>
        set({
            user,
        }),

    clearUser: () =>
        set({
            user: null,
        }),

    setLoading: (loading) =>
        set({
            isLoading: loading,
        }),
}));