import bikesData from '../data/bikes.json';
import {
    getCouponDiscount,
    getShippingFee,
    isCouponCodeValid,
    normalizeCouponCode,
} from './couponService';
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
    if (elapsed >= 24 * 60 * 60 * 1000) return 'Giao hàng thành công';
    if (elapsed >= 60 * 60 * 1000) return 'Đang vận chuyển';
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
    if (getOrderStatus(order) !== 'Chờ xác nhận') {
        throw new Error('Chỉ có thể hủy đơn hàng đang chờ xác nhận.');
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

export function createOrder({
    items,
    recipient,
    couponCode,
    deliveryMethod,
    paymentMethod,
    user,
}: {
    items: CheckoutItem[];
    recipient: RecipientDetails;
    couponCode: string;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    user: { id: string; email: string } | null;
}): OrderRecord {
    if (items.length === 0) throw new Error('Giỏ hàng đang trống.');

    const stock = readStorage<Record<string, number>>(STOCK_STORAGE_KEY, {});
    if (typeof stock !== 'object' || stock === null || Array.isArray(stock)) {
        throw new Error(`Dữ liệu ${STOCK_STORAGE_KEY} trong bộ nhớ trình duyệt không hợp lệ.`);
    }

    const groupedItems = new Map<string, { bike: (typeof bikesData)[number]; quantity: number }>();
    for (const item of items) {
        const bike = bikesData.find((candidate) => candidate.id === item.id);
        if (
            !bike
            || !Number.isSafeInteger(item.quantity)
            || item.quantity < 1
            || !Number.isSafeInteger(item.price)
            || item.price !== bike.price
        ) {
            throw new Error(`Thông tin sản phẩm "${item.name}" không hợp lệ.`);
        }

        const available = stock[item.id] ?? bike.stock;
        const quantity = (groupedItems.get(item.id)?.quantity ?? 0) + item.quantity;
        if (!Number.isSafeInteger(available) || available < 0 || quantity > available) {
            throw new Error(`Sản phẩm "${item.name}" không đủ tồn kho.`);
        }
        groupedItems.set(item.id, { bike, quantity });
    }

    const normalizedCoupon = normalizeCouponCode(couponCode);
    if (normalizedCoupon && !isCouponCodeValid(normalizedCoupon)) {
        throw new Error('Mã giảm giá không hợp lệ.');
    }
    if (deliveryMethod !== 'standard' && deliveryMethod !== 'express') {
        throw new Error('Phương thức vận chuyển không hợp lệ.');
    }
    if (paymentMethod !== 'cod' && paymentMethod !== 'qr' && paymentMethod !== 'card') {
        throw new Error('Phương thức thanh toán không hợp lệ.');
    }
    if (Object.values(recipient).some((value) => !value.trim())) {
        throw new Error('Thông tin người nhận chưa đầy đủ.');
    }

    const orders = readStorage<OrderRecord[]>(ORDERS_STORAGE_KEY, []);
    if (!Array.isArray(orders)) {
        throw new Error(`Dữ liệu ${ORDERS_STORAGE_KEY} trong bộ nhớ trình duyệt không hợp lệ.`);
    }

    const subtotal = items.reduce((sum, item) => {
        const lineTotal = item.price * item.quantity;
        const nextSubtotal = sum + lineTotal;
        if (!Number.isSafeInteger(lineTotal) || !Number.isSafeInteger(nextSubtotal)) {
            throw new Error('Tổng giá trị đơn hàng vượt quá giới hạn hợp lệ.');
        }
        return nextSubtotal;
    }, 0);
    const discount = getCouponDiscount(normalizedCoupon, subtotal);
    const shipping = getShippingFee(deliveryMethod, normalizedCoupon);
    const order: OrderRecord = {
        id: `DH-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
        recipient: { ...recipient },
        items: items.map((item) => ({ ...item })),
        subtotal,
        discount,
        shipping,
        total: Math.max(0, subtotal - discount + shipping),
        couponCode: normalizedCoupon,
        deliveryMethod,
        paymentMethod,
        status: 'Chờ xác nhận',
    };

    for (const [bikeId, { bike, quantity }] of groupedItems) {
        stock[bikeId] = (stock[bikeId] ?? bike.stock) - quantity;
    }

    const previousOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    let orderSaved = false;
    try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([...orders, order]));
        orderSaved = true;
        localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(stock));
    } catch (error) {
        if (orderSaved) {
            try {
                if (previousOrders === null) localStorage.removeItem(ORDERS_STORAGE_KEY);
                else localStorage.setItem(ORDERS_STORAGE_KEY, previousOrders);
            } catch {
                throw new Error('Không thể hoàn tất hoặc khôi phục dữ liệu đơn hàng.');
            }
        }
        throw new Error(error instanceof Error ? `Không thể lưu đơn hàng: ${error.message}` : 'Không thể lưu đơn hàng.');
    }

    return order;
}
