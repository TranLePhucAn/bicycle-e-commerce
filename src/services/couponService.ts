export type CouponCode = 'BIKE10' | 'FREESHIP';
export type DeliveryMethod = 'standard' | 'express';
export type PaymentMethod = 'cod' | 'qr' | 'card';

const shippingFees: Record<DeliveryMethod, number> = {
    standard: 150000,
    express: 300000,
};

export function normalizeCouponCode(code: string): string {
    return code.trim().toUpperCase();
}

export function isCouponCodeValid(code: string): boolean {
    const normalizedCode = normalizeCouponCode(code);
    return normalizedCode === 'BIKE10' || normalizedCode === 'FREESHIP';
}

export function getCouponDiscount(code: string, subtotal: number): number {
    return normalizeCouponCode(code) === 'BIKE10' ? Math.round(subtotal * 0.1) : 0;
}

export function getShippingFee(method: DeliveryMethod, couponCode: string): number {
    return normalizeCouponCode(couponCode) === 'FREESHIP' ? 0 : shippingFees[method];
}
