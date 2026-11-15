import { callFakeApi } from './fakeApi';
import type { CartItem } from '../context/CartContext';

export async function mergeGuestCart(userId: string, guestItems: CartItem[], accountItems: CartItem[]) {
    const merged = [...accountItems];

    for (const guestItem of guestItems) {
        const found = merged.find((i) => i.id === guestItem.id);
        if (found) {
            found.quantity += guestItem.quantity;
        } else {
            merged.push(guestItem);
        }
    }

    return callFakeApi(merged, 500);
}