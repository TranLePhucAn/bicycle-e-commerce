import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    category?: string;
}

interface CartContextValue {
    cartItems: CartItem[];
    totalCount: number;
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    addToCart: (bike: any, quantity?: number) => void;
    updateQuantity: (id: string, delta: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
}

const CART_STORAGE_KEY = 'bikeshop_cart';
const bikeImages = import.meta.glob('../assets/images/*.png', {
    eager: true,
    import: 'default',
    query: '?url',
});

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getImageUrl(image: string | undefined) {
    if (!image) return '';
    if (/^(https?:|data:|blob:)/i.test(image)) return image;

    const fileName = image.split('/').pop();
    return (bikeImages[`../assets/images/${fileName}`] as string | undefined) ?? image;
}

function loadCart(): CartItem[] {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (!savedCart) return [];

        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) return [];

        return parsedCart.filter((item) =>
            item
            && typeof item.id === 'string'
            && typeof item.name === 'string'
            && Number.isFinite(item.price)
            && Number.isInteger(item.quantity)
            && item.quantity > 0
        );
    } catch (error) {
        console.error('Không thể đọc giỏ hàng đã lưu:', error);
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);

    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error('Không thể lưu giỏ hàng:', error);
        }
    }, [cartItems]);

    const addToCart = (bike: any, quantity = 1) => {
        if (!bike?.id || !Number.isInteger(quantity) || quantity < 1) return;

        const item: CartItem = {
            id: String(bike.id),
            name: bike.name || 'Xe đạp',
            price: Number(bike.price) || 0,
            quantity,
            image: getImageUrl(bike.image),
            category: bike.category,
        };

        setCartItems((currentItems) => {
            const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);
            if (!existingItem) return [...currentItems, item];

            return currentItems.map((cartItem) =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + quantity }
                    : cartItem
            );
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems((currentItems) => currentItems.map((item) =>
            item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    };

    const removeFromCart = (id: string) => {
        setCartItems((currentItems) => currentItems.filter((item) => item.id !== id));
    };

    const clearCart = () => setCartItems([]);

    const totals = useMemo(() => {
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shippingFee = cartItems.length > 0 ? 150000 : 0;

        return {
            totalCount,
            subtotal,
            shippingFee,
            totalAmount: subtotal + shippingFee,
        };
    }, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            ...totals,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
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
