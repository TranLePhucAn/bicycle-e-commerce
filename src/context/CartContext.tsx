import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { apiRequest } from '../services/apiClient';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
    stock?: number;
}

interface CartContextValue {
    cartItems: CartItem[];
    selectedIds: string[];
    totalCount: number;
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    addToCart: (bike: any, quantity?: number) => Promise<boolean>;
    updateQuantity: (id: string, delta: number) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    toggleItem: (id: string) => void;
    toggleAll: () => void;
}

interface CartResponse {
    items: CartItem[];
}

const bikeImages = import.meta.glob('../assets/images/*.png', {
    eager: true,
    import: 'default',
    query: '?url',
});

const CartContext = createContext<CartContextValue | undefined>(undefined);
const LEGACY_CART_KEY = 'bikeshop_cart';

function getImageUrl(image: string | undefined) {
    if (!image) return '';
    if (/^(https?:|data:|blob:|\/assets\/)/i.test(image)) return image;

    const fileName = image.split('/').pop();
    return (bikeImages[`../assets/images/${fileName}`] as string | undefined) ?? image;
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const hasLoadedCart = useRef(false);
    const { showToast } = useToast();
    const { user } = useAuth();

    const refreshCart = useCallback(async () => {
        const result = await apiRequest<CartResponse>('/api/cart');
        const items = result.items.map((item) => ({ ...item, image: getImageUrl(item.image) }));
        setCartItems(items);
        setSelectedIds((currentIds) => {
            const existingIds = new Set(items.map((item) => item.id));
            const keptIds = currentIds.filter((id) => existingIds.has(id));
            const newIds = items.map((item) => item.id).filter((id) => !currentIds.includes(id));
            return [...keptIds, ...newIds];
        });
    }, []);

    useEffect(() => {
        if (hasLoadedCart.current) {
            refreshCart().catch((error: Error) => {
                showToast(error.message || 'Không thể tải giỏ hàng từ máy chủ.', 'danger');
            });
            return;
        }
        hasLoadedCart.current = true;

        const loadCart = async () => {
            const savedCart = localStorage.getItem(LEGACY_CART_KEY);
            if (savedCart) {
                try {
                    const legacyItems = JSON.parse(savedCart);
                    const currentCart = await apiRequest<CartResponse>('/api/cart').catch(() => ({ items: [] }));
                    if (Array.isArray(legacyItems) && currentCart.items.length === 0) {
                        for (const item of legacyItems) {
                            if (item?.id && Number.isInteger(item.quantity) && item.quantity > 0) {
                                await apiRequest('/api/cart/items', {
                                    method: 'POST',
                                    body: JSON.stringify({ bikeId: item.id, quantity: item.quantity }),
                                }).catch(() => {});
                            }
                        }
                    }
                } catch (error) {
                    console.warn('Lỗi khi đọc giỏ hàng cũ từ localStorage:', error);
                } finally {
                    localStorage.removeItem(LEGACY_CART_KEY);
                }
            }
            await refreshCart();
        };

        loadCart().catch((error: Error) => {
            showToast(error.message || 'Không thể tải giỏ hàng từ máy chủ.', 'danger');
        });
    }, [refreshCart, showToast, user?.id]);

    const addToCart = async (bike: any, quantity = 1) => {
        if (!bike?.id || !Number.isInteger(quantity) || quantity < 1) return false;
        try {
            const result = await apiRequest<CartResponse>('/api/cart/items', {
                method: 'POST',
                body: JSON.stringify({ bikeId: bike.id, quantity }),
            });
            setCartItems(result.items.map((item) => ({ ...item, image: getImageUrl(item.image) })));
            setSelectedIds((currentIds) => currentIds.includes(String(bike.id))
                ? currentIds
                : [...currentIds, String(bike.id)]
            );
            return true;
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể thêm sản phẩm vào giỏ.', 'danger');
            return false;
        }
    };

    const updateQuantity = async (id: string, delta: number) => {
        const item = cartItems.find((cartItem) => cartItem.id === id);
        if (!item) return;
        const quantity = Math.max(1, item.quantity + delta);
        try {
            const result = await apiRequest<CartResponse>(`/api/cart/items/${encodeURIComponent(id)}`, {
                method: 'PUT',
                body: JSON.stringify({ quantity }),
            });
            setCartItems(result.items.map((cartItem) => ({ ...cartItem, image: getImageUrl(cartItem.image) })));
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể cập nhật số lượng.', 'danger');
        }
    };

    const removeFromCart = async (id: string) => {
        try {
            const result = await apiRequest<CartResponse>(`/api/cart/items/${encodeURIComponent(id)}`, { method: 'DELETE' });
            setCartItems(result.items.map((item) => ({ ...item, image: getImageUrl(item.image) })));
            setSelectedIds((currentIds) => currentIds.filter((itemId) => itemId !== id));
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể xóa sản phẩm khỏi giỏ.', 'danger');
        }
    };

    const clearCart = async () => {
        try {
            await apiRequest<CartResponse>('/api/cart', { method: 'DELETE' });
            setCartItems([]);
            setSelectedIds([]);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể xóa giỏ hàng.', 'danger');
        }
    };

    const toggleItem = (id: string) => {
        setSelectedIds((currentIds) => currentIds.includes(id)
            ? currentIds.filter((itemId) => itemId !== id)
            : [...currentIds, id]
        );
    };

    const toggleAll = () => {
        const allSelected = cartItems.length > 0 && cartItems.every((item) => selectedIds.includes(item.id));
        setSelectedIds(allSelected ? [] : cartItems.map((item) => item.id));
    };

    const totals = useMemo(() => {
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shippingFee = cartItems.length > 0 ? 150000 : 0;
        return { totalCount, subtotal, shippingFee, totalAmount: subtotal + shippingFee };
    }, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            selectedIds,
            ...totals,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            refreshCart,
            toggleItem,
            toggleAll,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart phải được dùng bên trong CartProvider');
    return context;
}
