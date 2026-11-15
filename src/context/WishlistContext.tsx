import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
    wishlistItems: any[];
    wishlistCount: number;
    isInWishlist: (bikeId: string | number) => boolean;
    toggleWishlist: (bike: any) => boolean;
    removeFromWishlist: (bikeId: string | number) => void;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlistItems: [],
    wishlistCount: 0,
    isInWishlist: () => false,
    toggleWishlist: () => false,
    removeFromWishlist: () => {},
    clearWishlist: () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoggedIn, openLoginModal } = useAuth() as any;
    const { showToast } = useToast();
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);

    const userKey = isLoggedIn && user
        ? `bikeshop_wishlist_${user.id || user.email || user.username}`
        : null;

    useEffect(() => {
        if (!userKey) {
            setWishlistItems([]);
            return;
        }
        try {
            const saved = localStorage.getItem(userKey);
            setWishlistItems(saved ? JSON.parse(saved) : []);
        } catch {
            setWishlistItems([]);
        }
    }, [userKey]);

    const saveToStorage = (items: any[]) => {
        setWishlistItems(items);
        if (userKey) {
            try {
                localStorage.setItem(userKey, JSON.stringify(items));
            } catch (err) {
                console.error('Lỗi lưu danh sách yêu thích:', err);
            }
        }
    };

    const isInWishlist = (bikeId: string | number) => {
        return wishlistItems.some((item) => String(item.id) === String(bikeId));
    };

    const toggleWishlist = (bike: any) => {
        if (!isLoggedIn || !userKey) {
            showToast('Vui lòng đăng nhập để lưu sản phẩm yêu thích!', 'warning');
            openLoginModal?.('login');
            return false;
        }

        const exists = isInWishlist(bike.id);
        if (exists) {
            const updated = wishlistItems.filter((item) => String(item.id) !== String(bike.id));
            saveToStorage(updated);
            showToast(`Đã bỏ "${bike.name}" khỏi danh sách yêu thích.`, 'info');
            return false;
        } else {
            const updated = [bike, ...wishlistItems];
            saveToStorage(updated);
            showToast(`Đã thêm "${bike.name}" vào danh sách yêu thích!`, 'success');
            return true;
        }
    };

    const removeFromWishlist = (bikeId: string | number) => {
        const updated = wishlistItems.filter((item) => String(item.id) !== String(bikeId));
        saveToStorage(updated);
        showToast('Đã xóa sản phẩm khỏi danh sách yêu thích.', 'info');
    };

    const clearWishlist = () => {
        saveToStorage([]);
        showToast('Đã xóa toàn bộ danh sách yêu thích.', 'info');
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                wishlistCount: wishlistItems.length,
                isInWishlist,
                toggleWishlist,
                removeFromWishlist,
                clearWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}