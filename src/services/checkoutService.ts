import { apiRequest } from './apiClient';
import type { DeliveryMethod, PaymentMethod } from './couponService';

export interface CheckoutItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface RecipientDetails {
    name: string;
    phone: string;
    email: string;
    address: string;
}

export type OrderStatus =
    | 'Đã tiếp nhận'
    | 'Đang chuẩn bị'
    | 'Đang vận chuyển'
    | 'Giao hàng thành công';

export interface OrderRecord {
    id: string;
    createdAt: string;
    userId: string | null;
    userEmail: string | null;
    recipient: RecipientDetails;
    items: CheckoutItem[];
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    couponCode: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    status: OrderStatus;
}

export async function createOrder({
    items,
    recipient,
    couponCode,
    deliveryMethod,
    paymentMethod,
}: {
    items: CheckoutItem[];
    recipient: RecipientDetails;
    couponCode: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
}) {
    const result = await apiRequest<{ order: OrderRecord }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
            items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
            recipient,
            couponCode,
            deliveryMethod,
            paymentMethod,
        }),
    });
    return result.order;
}

export async function getOrders() {
    const result = await apiRequest<{ orders: OrderRecord[] }>('/api/orders/me');
    return result.orders;
}
