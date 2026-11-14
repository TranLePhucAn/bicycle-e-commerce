import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { apiRequest } from '../services/apiClient';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
}

export type AuthModalMode = 'login' | 'register';

export interface AuthResult {
    success: boolean;
    message: string;
}

interface AuthContextValue {
    user: User | null;
    isLoggedIn: boolean;
    isAuthLoading: boolean;
    login: (email: string, password: string) => Promise<AuthResult>;
    quickLogin: () => Promise<AuthResult>;
    register: (userData: { name: string; email: string; password: string }) => Promise<AuthResult>;
    logout: () => Promise<void>;
    isLoginModalOpen: boolean;
    authModalMode: AuthModalMode;
    openLoginModal: (mode?: AuthModalMode) => void;
    closeLoginModal: () => void;
    setAuthModalMode: (mode: AuthModalMode) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function importLegacyOrders() {
    const savedOrders = localStorage.getItem('my_orders');
    if (!savedOrders) return;

    try {
        const orders = JSON.parse(savedOrders);
        if (!Array.isArray(orders) || orders.length === 0) return;

        const result = await apiRequest<{ handled: number }>('/api/orders/import-legacy', {
            method: 'POST',
            body: JSON.stringify({ orders }),
        });
        if (result.handled === orders.length) {
            localStorage.removeItem('my_orders');
            localStorage.removeItem('bike_stock');
        }
    } catch (error) {
        console.warn('Không thể chuyển lịch sử đơn hàng cũ:', error);
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
    const hasLoadedSession = useRef(false);

    const loadCurrentUser = useCallback(async () => {
        try {
            const result = await apiRequest<{ user: User | null }>('/api/auth/me');
            if (result.user) {
                setUser(result.user);
                importLegacyOrders().catch((error) => console.error('Không thể chuyển lịch sử đơn hàng cũ:', error));
                return;
            }

            const savedUsers = localStorage.getItem('bikeshop_users');
            if (savedUsers) {
                try {
                    const legacyUsers = JSON.parse(savedUsers);
                    if (Array.isArray(legacyUsers) && legacyUsers.length > 0) {
                        await apiRequest('/api/auth/import-users', {
                            method: 'POST',
                            body: JSON.stringify({
                                users: legacyUsers.map((legacyUser) => ({
                                    name: legacyUser.name,
                                    email: legacyUser.email,
                                    password: legacyUser.password,
                                    createdAt: legacyUser.createdAt,
                                })),
                            }),
                        }).catch(() => {});

                        const savedUser = localStorage.getItem('current_user');
                        if (savedUser) {
                            try {
                                const legacySession = JSON.parse(savedUser);
                                const legacyAccount = legacyUsers.find((account) =>
                                    account.email?.toLowerCase() === legacySession.email?.toLowerCase()
                                );
                                if (legacyAccount?.password) {
                                    const loginResult = await apiRequest<{ user: User }>('/api/auth/login', {
                                        method: 'POST',
                                        body: JSON.stringify({ email: legacyAccount.email, password: legacyAccount.password }),
                                    });
                                    setUser(loginResult.user);
                                }
                            } catch {
                                // Bỏ qua nếu dữ liệu current_user cũ không hợp lệ
                            }
                        }

                        localStorage.removeItem('bikeshop_users');
                        localStorage.removeItem('current_user');
                        importLegacyOrders().catch((err) => console.error('Không thể chuyển lịch sử đơn hàng cũ:', err));
                    }
                } catch {
                    localStorage.removeItem('bikeshop_users');
                    localStorage.removeItem('current_user');
                }
            }
        } catch (error) {
            console.error('Không thể kiểm tra phiên đăng nhập:', error);
        } finally {
            setIsAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasLoadedSession.current) return;
        hasLoadedSession.current = true;
        loadCurrentUser();
    }, [loadCurrentUser]);

    const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
            const result = await apiRequest<{ user: User }>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            setUser(result.user);
            setIsLoginModalOpen(false);
            importLegacyOrders().catch((error) => console.error('Không thể chuyển lịch sử đơn hàng cũ:', error));
            return { success: true, message: `Chào mừng trở lại, ${result.user.name}!` };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Không thể đăng nhập.',
            };
        }
    };

    const register = async (userData: { name: string; email: string; password: string }): Promise<AuthResult> => {
        try {
            const result = await apiRequest<{ user: User }>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            setUser(result.user);
            setIsLoginModalOpen(false);
            importLegacyOrders().catch((error) => console.error('Không thể chuyển lịch sử đơn hàng cũ:', error));
            return { success: true, message: `Chúc mừng ${result.user.name}! Bạn đã đăng ký thành công.` };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Không thể đăng ký tài khoản.',
            };
        }
    };

    const quickLogin = async (): Promise<AuthResult> => {
        try {
            const result = await apiRequest<{ user: User }>('/api/auth/demo', { method: 'POST' });
            setUser(result.user);
            setIsLoginModalOpen(false);
            return { success: true, message: `Chào mừng trở lại, ${result.user.name}!` };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Không thể đăng nhập tài khoản demo.',
            };
        }
    };

    const logout = async () => {
        try {
            await apiRequest('/api/auth/logout', { method: 'POST' });
        } finally {
            setUser(null);
        }
    };

    const openLoginModal = (mode?: AuthModalMode) => {
        setAuthModalMode(mode === 'register' ? 'register' : 'login');
        setIsLoginModalOpen(true);
    };

    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn: !!user,
            isAuthLoading,
            login,
            quickLogin,
            register,
            logout,
            isLoginModalOpen,
            authModalMode,
            openLoginModal,
            closeLoginModal,
            setAuthModalMode,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
    return context;
}
