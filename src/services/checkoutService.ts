import bikesData from '../data/bikes.json';
import {
    getCouponDiscount,
    getShippingFee,
    isCouponCodeValid,
    normalizeCouponCode,
} from './couponService';
import { apiRequest } from './apiClient';
import type { DeliveryMethod, PaymentMethod } from './couponService';
export type { DeliveryMethod, PaymentMethod } from './couponService';

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
    | 'Chờ xác nhận'
    | 'Đang chuẩn bị'
    | 'Đang vận chuyển'
    | 'Giao hàng thành công'
    | 'Đã hủy';

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
    demoStatus?: OrderStatus;
}

export const ORDERS_STORAGE_KEY = 'my_orders';
export const STOCK_STORAGE_KEY = 'bike_stock';

function readStorage<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;

    try {
        return JSON.parse(raw) as T;
    } catch {
        throw new Error(`Dữ liệu ${key} trong bộ nhớ trình duyệt không hợp lệ.`);
    }
}

export function getOrderStatus(order: OrderRecord, now = Date.now()): OrderStatus {
    if (order.status === 'Đã hủy') return 'Đã hủy';
    if (order.demoStatus) return order.demoStatus;

    const createdAt = Date.parse(order.createdAt);
    if (!Number.isFinite(createdAt)) return 'Chờ xác nhận';

    const elapsed = Math.max(0, now - createdAt);
    if (elapsed >= 3 * 60 * 1000) return 'Giao hàng thành công';
    if (elapsed >= 2 * 60 * 1000) return 'Đang vận chuyển';
    if (elapsed >= 60 * 1000) return 'Đang chuẩn bị';
    return 'Chờ xác nhận';
}

export function getOrdersForUser(userId: string): OrderRecord[] {
    const orders = readStorage<OrderRecord[]>(ORDERS_STORAGE_KEY, []);
    if (!Array.isArray(orders)) {
        throw new Error(`Dữ liệu ${ORDERS_STORAGE_KEY} trong bộ nhớ trình duyệt không hợp lệ.`);
    }

    return orders.filter((order) => order.userId === userId);
}

function persistOrderAndStock(orders: OrderRecord[], stock: Record<string, number>): void {
    const previousOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    const previousStock = localStorage.getItem(STOCK_STORAGE_KEY);

    try {
        localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stock));
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
        try {
            if (previousStock === null) localStorage.removeItem(STOCK_STORAGE_KEY);
            else localStorage.setItem(STOCK_STORAGE_KEY, previousStock);
            if (previousOrders === null) localStorage.removeItem(ORDERS_STORAGE_KEY);
            else localStorage.setItem(ORDERS_STORAGE_KEY, previousOrders);
        } catch {
            throw new Error('Không thể cập nhật đơn hàng hoặc khôi phục tồn kho.');
        }
        throw new Error(error instanceof Error ? `Không thể cập nhật đơn hàng: ${error.message}` : 'Không thể cập nhật đơn hàng.');
    }
}

export function cancelOrder(orderId: string, userId: string): OrderRecord {
    const orders = readStorage<OrderRecord[]>(ORDERS_STORAGE_KEY, []);
    if (!Array.isArray(orders)) {
        throw new Error(`Dữ liệu ${ORDERS_STORAGE_KEY} trong bộ nhớ trình duyệt không hợp lệ.`);
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId && order.userId === userId);
    if (orderIndex < 0) throw new Error('Không tìm thấy đơn hàng.');

    const order = orders[orderIndex];
    const status = getOrderStatus(order);
    if (status === 'Giao hàng thành công' || status === 'Đã hủy') {
        throw new Error('Không thể hủy đơn hàng đã giao thành công hoặc đã hủy.');
    }

    const stock = readStorage<Record<string, number>>(STOCK_STORAGE_KEY, {});
    if (typeof stock !== 'object' || stock === null || Array.isArray(stock)) {
        throw new Error(`Dữ liệu ${STOCK_STORAGE_KEY} trong bộ nhớ trình duyệt không hợp lệ.`);
    }

    const quantities = new Map<string, number>();
    for (const item of order.items) {
        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
            throw new Error(`Số lượng sản phẩm "${item.name}" trong đơn hàng không hợp lệ.`);
        }
        quantities.set(item.id, (quantities.get(item.id) ?? 0) + item.quantity);
    }

    for (const [bikeId, quantity] of quantities) {
        const bike = bikesData.find((candidate) => candidate.id === bikeId);
        if (!bike) throw new Error(`Không tìm thấy sản phẩm mã ${bikeId} để hoàn tồn kho.`);
        const available = stock[bikeId] ?? bike.stock;
        const restored = available + quantity;
        if (!Number.isSafeInteger(available) || available < 0 || !Number.isSafeInteger(restored)) {
            throw new Error(`Tồn kho sản phẩm "${bike.name}" không hợp lệ.`);
        }
        stock[bikeId] = restored;
    }

    const cancelledOrder: OrderRecord = { ...order, status: 'Đã hủy' };
    const updatedOrders = orders.map((savedOrder, index) => index === orderIndex ? cancelledOrder : savedOrder);
    persistOrderAndStock(updatedOrders, stock);
    return cancelledOrder;
}

export function advanceOrderStatus(orderId: string, userId: string, now = Date.now()): OrderRecord {
    const orders = readStorage<OrderRecord[]>(ORDERS_STORAGE_KEY, []);
    if (!Array.isArray(orders)) {
        throw new Error(`Dữ liệu ${ORDERS_STORAGE_KEY} trong bộ nhớ trình duyệt không hợp lệ.`);
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId && order.userId === userId);
    if (orderIndex < 0) throw new Error('Không tìm thấy đơn hàng.');

    const order = orders[orderIndex];
    const status = getOrderStatus(order, now);
    const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
        'Chờ xác nhận': 'Đang chuẩn bị',
        'Đang chuẩn bị': 'Đang vận chuyển',
        'Đang vận chuyển': 'Giao hàng thành công',
    };
    const nextOrderStatus = nextStatus[status];
    if (!nextOrderStatus) throw new Error('Đơn hàng đã ở trạng thái cuối, không thể đẩy nhanh thêm.');

    const advancedOrder = { ...order, demoStatus: nextOrderStatus };
    const updatedOrders = orders.map((savedOrder, index) => index === orderIndex ? advancedOrder : savedOrder);
    try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
    } catch (error) {
        throw new Error(error instanceof Error ? `Không thể cập nhật trạng thái đơn hàng: ${error.message}` : 'Không thể cập nhật trạng thái đơn hàng.');
    }
    return advancedOrder;
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
}): Promise<OrderRecord> {
    const normalizedCoupon = normalizeCouponCode(couponCode);
    if (items.length === 0) throw new Error('Giỏ hàng đang trống.');
    if (normalizedCoupon && !isCouponCodeValid(normalizedCoupon)) {
        throw new Error('Mã giảm giá không hợp lệ.');
    }

    const result = await apiRequest<{ order: OrderRecord; cart: unknown[] }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
            items,
            recipient,
            couponCode: normalizedCoupon,
            deliveryMethod,
            paymentMethod,
        }),
    });
    return result.order;
}
