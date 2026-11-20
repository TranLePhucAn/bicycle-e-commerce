export interface ProductReview {
    id: string;
    userId: string;
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface ReturnRequest {
    id: string;
    userId: string;
    orderId: string;
    productIds: string[];
    productNames: string[];
    reason: string;
    details: string;
    status: 'Chờ xử lý';
    createdAt: string;
}

export interface CustomerNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'order' | 'review' | 'return';
    read: boolean;
    createdAt: string;
}

export const REVIEWS_STORAGE_KEY = 'bike_reviews';
export const RETURNS_STORAGE_KEY = 'bike_return_requests';
export const NOTIFICATIONS_STORAGE_KEY = 'bike_notifications';

function readArray<T>(key: string): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
        const value = JSON.parse(raw);
        return Array.isArray(value) ? value as T[] : [];
    } catch {
        return [];
    }
}

function writeArray<T>(key: string, value: T[]): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        throw new Error(error instanceof Error ? `Không thể lưu dữ liệu: ${error.message}` : 'Không thể lưu dữ liệu.');
    }
}

export function getProductReview(orderId: string, productId: string, userId: string): ProductReview | null {
    return readArray<ProductReview>(REVIEWS_STORAGE_KEY).find((review) =>
        review.orderId === orderId && review.productId === productId && review.userId === userId
    ) ?? null;
}

export function saveProductReview({
    orderId,
    productId,
    userId,
    rating,
    comment,
}: {
    orderId: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
}): ProductReview {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Vui lòng chọn số sao từ 1 đến 5.');
    }
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
        throw new Error('Vui lòng nhập nội dung đánh giá.');
    }

    const reviews = readArray<ProductReview>(REVIEWS_STORAGE_KEY);
    const existingIndex = reviews.findIndex((review) =>
        review.orderId === orderId && review.productId === productId && review.userId === userId
    );
    const review: ProductReview = {
        id: existingIndex >= 0 ? reviews[existingIndex].id : `RV-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        userId,
        orderId,
        productId,
        rating,
        comment: trimmedComment,
        createdAt: existingIndex >= 0 ? reviews[existingIndex].createdAt : new Date().toISOString(),
    };

    if (existingIndex >= 0) reviews[existingIndex] = review;
    else reviews.push(review);
    writeArray(REVIEWS_STORAGE_KEY, reviews);
    addNotification(userId, 'Đánh giá đã được lưu', `Cảm ơn bạn đã đánh giá sản phẩm trong đơn ${orderId}.`, 'review');
    return review;
}

export function getReturnRequest(orderId: string, userId: string): ReturnRequest | null {
    return readArray<ReturnRequest>(RETURNS_STORAGE_KEY).find((request) =>
        request.orderId === orderId && request.userId === userId
    ) ?? null;
}

export function createReturnRequest({
    orderId,
    userId,
    productIds,
    productNames,
    reason,
    details,
}: {
    orderId: string;
    userId: string;
    productIds: string[];
    productNames: string[];
    reason: string;
    details: string;
}): ReturnRequest {
    if (productIds.length === 0) throw new Error('Vui lòng chọn ít nhất một sản phẩm cần đổi trả.');
    if (!reason.trim()) throw new Error('Vui lòng chọn lý do đổi trả.');
    if (getReturnRequest(orderId, userId)) throw new Error('Đơn hàng này đã có yêu cầu đổi trả.');

    const requests = readArray<ReturnRequest>(RETURNS_STORAGE_KEY);
    const request: ReturnRequest = {
        id: `DT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        userId,
        orderId,
        productIds,
        productNames,
        reason: reason.trim(),
        details: details.trim(),
        status: 'Chờ xử lý',
        createdAt: new Date().toISOString(),
    };
    requests.push(request);
    writeArray(RETURNS_STORAGE_KEY, requests);
    addNotification(
        userId,
        'Đã gửi yêu cầu đổi trả',
        `Đơn ${orderId}: ${productNames.join(', ')} đang chờ xử lý đổi trả.`,
        'return',
    );
    return request;
}

export function getNotifications(userId: string): CustomerNotification[] {
    return readArray<CustomerNotification>(NOTIFICATIONS_STORAGE_KEY)
        .filter((notification) => notification.userId === userId)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function addNotification(
    userId: string,
    title: string,
    message: string,
    type: CustomerNotification['type'] = 'order',
): CustomerNotification {
    const notifications = readArray<CustomerNotification>(NOTIFICATIONS_STORAGE_KEY);
    const notification: CustomerNotification = {
        id: `TB-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        userId,
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
    };
    notifications.unshift(notification);
    writeArray(NOTIFICATIONS_STORAGE_KEY, notifications);
    return notification;
}

export function markNotificationsRead(userId: string): void {
    const notifications = readArray<CustomerNotification>(NOTIFICATIONS_STORAGE_KEY).map((notification) =>
        notification.userId === userId ? { ...notification, read: true } : notification
    );
    writeArray(NOTIFICATIONS_STORAGE_KEY, notifications);
}
