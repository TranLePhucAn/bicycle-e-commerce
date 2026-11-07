import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
}

export interface StoredUser extends User {
    password: string;
}

export type AuthModalMode = 'login' | 'register';

export interface AuthResult {
    success: boolean;
    message: string;
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => AuthResult;
    quickLogin: () => AuthResult;
    register: (userData: { name: string; email: string; password: string }) => AuthResult;
    logout: () => void;
    isEmailTaken: (email: string) => boolean;
    isLoginModalOpen: boolean;
    authModalMode: AuthModalMode;
    openLoginModal: (mode?: AuthModalMode) => void;
    closeLoginModal: () => void;
    setAuthModalMode: (mode: AuthModalMode) => void;
}

const STORAGE_KEY_CURRENT_USER = 'current_user';
const STORAGE_KEY_USERS = 'bikeshop_users';

// Dữ liệu người dùng mẫu ban đầu nếu hệ thống chưa có dữ liệu trong localStorage
const DEFAULT_USERS: StoredUser[] = [
    {
        id: 'usr-default-01',
        name: 'Trần Lê Phúc An',
        email: 'an.tran@example.com',
        password: 'password123',
        role: 'Thành viên VIP',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'usr-default-02',
        name: 'Khách hàng Demo',
        email: 'demo@bikeshop.vn',
        password: 'password123',
        role: 'Khách hàng thân thiết',
        createdAt: new Date().toISOString(),
    },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredUsers(): StoredUser[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_USERS);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_USERS));
            return DEFAULT_USERS;
        }
        return JSON.parse(raw) as StoredUser[];
    } catch {
        return DEFAULT_USERS;
    }
}

function saveStoredUsers(users: StoredUser[]) {
    try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch (e) {
        console.error('Không thể lưu danh sách users vào localStorage:', e);
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // 1. Khởi tạo current_user từ localStorage
    const [user, setUser] = useState<User | null>(() => {
        try {
            const rawUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
            if (rawUser) {
                return JSON.parse(rawUser) as User;
            }
        } catch (e) {
            console.error('Lỗi khi đọc current_user từ localStorage:', e);
        }
        return null;
    });

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

    // Đảm bảo có sẵn danh sách users ban đầu
    useEffect(() => {
        getStoredUsers();
    }, []);

    // 2. Chức năng kiểm tra email đã tồn tại hay chưa
    const isEmailTaken = (email: string): boolean => {
        if (!email) return false;
        const normalizedEmail = email.trim().toLowerCase();
        const users = getStoredUsers();
        return users.some((u) => u.email.toLowerCase() === normalizedEmail);
    };

    // 3. Chức năng Đăng Ký
    const register = ({
        name,
        email,
        password,
    }: {
        name: string;
        email: string;
        password: string;
    }): AuthResult => {
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedName = name.trim();

        // Kiểm tra chặn email trùng
        if (isEmailTaken(normalizedEmail)) {
            return {
                success: false,
                message: 'Email này đã được đăng ký trong hệ thống! Vui lòng sử dụng email khác.',
            };
        }

        const newUser: StoredUser = {
            id: `usr-${Date.now()}`,
            name: trimmedName,
            email: normalizedEmail,
            password: password,
            role: 'Thành viên mới',
            createdAt: new Date().toISOString(),
        };

        // Lưu vào danh sách users
        const users = getStoredUsers();
        users.push(newUser);
        saveStoredUsers(users);

        // Tạo thông tin session không chứa password
        const currentUserData: User = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt,
        };

        // Lưu current_user vào localStorage và State
        try {
            localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUserData));
        } catch (e) {
            console.error('Lỗi khi lưu current_user vào localStorage:', e);
        }

        setUser(currentUserData);
        setIsLoginModalOpen(false);

        return {
            success: true,
            message: `Chúc mừng ${trimmedName}! Bạn đã đăng ký tài khoản thành công.`,
        };
    };

    // 4. Chức năng Đăng Nhập
    const login = (email: string, password: string): AuthResult => {
        const normalizedEmail = email.trim().toLowerCase();
        const users = getStoredUsers();

        const foundUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (!foundUser) {
            return {
                success: false,
                message: 'Email không tồn tại trong hệ thống! Vui lòng kiểm tra lại hoặc Đăng ký.',
            };
        }

        if (foundUser.password !== password) {
            return {
                success: false,
                message: 'Mật khẩu không chính xác! Vui lòng thử lại.',
            };
        }

        const currentUserData: User = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role,
            createdAt: foundUser.createdAt,
        };

        // Lưu current_user vào localStorage và State
        try {
            localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUserData));
        } catch (e) {
            console.error('Lỗi khi lưu current_user vào localStorage:', e);
        }

        setUser(currentUserData);
        setIsLoginModalOpen(false);

        return {
            success: true,
            message: `Chào mừng trở lại, ${foundUser.name}!`,
        };
    };

    // Đăng nhập nhanh tài khoản mẫu
    const quickLogin = (): AuthResult => {
        return login('an.tran@example.com', 'password123');
    };

    // 5. Chức năng Đăng Xuất
    const logout = () => {
        try {
            localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        } catch (e) {
            console.error('Lỗi khi xóa current_user khỏi localStorage:', e);
        }
        setUser(null);
    };

    const openLoginModal = (mode?: AuthModalMode) => {
        setAuthModalMode(mode === 'register' ? 'register' : 'login');
        setIsLoginModalOpen(true);
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                login,
                quickLogin,
                register,
                logout,
                isEmailTaken,
                isLoginModalOpen,
                authModalMode,
                openLoginModal,
                closeLoginModal,
                setAuthModalMode,
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
