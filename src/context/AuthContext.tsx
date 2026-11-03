import React, { createContext, useContext, useState } from 'react';

export interface User {
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (email?: string, name?: string) => void;
    logout: () => void;
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const login = (email = 'an.tran@example.com', name = 'Trần Lê Phúc An') => {
        setUser({
            name,
            email,
            role: 'Thành viên',
        });
        setIsLoginModalOpen(false);
    };

    const logout = () => {
        setUser(null);
    };

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                login,
                logout,
                isLoginModalOpen,
                openLoginModal,
                closeLoginModal,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
