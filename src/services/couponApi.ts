import { callFakeApi } from './fakeApi';
import { isCouponCodeValid, getCouponDiscount, getShippingFee, normalizeCouponCode } from './couponService';
import type { DeliveryMethod } from './couponService';

export async function applyCouponCode(rawCode: string, subtotal: number, deliveryMethod: DeliveryMethod) {
    const code = normalizeCouponCode(rawCode);

    if (!isCouponCodeValid(code)) {
        return callFakeApi({ valid: false, discount: 0, shippingFee: getShippingFee(deliveryMethod, ''), code }, 400);
    }

    const discount = getCouponDiscount(code, subtotal);
    const shippingFee = getShippingFee(deliveryMethod, code);
    return callFakeApi({ valid: true, discount, shippingFee, code }, 400);
}