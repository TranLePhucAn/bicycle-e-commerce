import { callFakeApi } from './fakeApi';
import bikesData from '../data/bikes.json';
import { STOCK_STORAGE_KEY } from './checkoutService';

export interface StockCheckResult {
    id: string;
    name: string;
    requested: number;
    available: number;
    isOverStock: boolean;
}

export async function checkCartStock(items: { id: string; name: string; quantity: number }[]) {
    const raw = localStorage.getItem(STOCK_STORAGE_KEY);
    const stockMap: Record<string, number> = raw ? JSON.parse(raw) : {};

    const results: StockCheckResult[] = items.map((item) => {
        const bike = bikesData.find((b) => b.id === item.id);
        const available = stockMap[item.id] ?? bike?.stock ?? 0;

        return {
            id: item.id,
            name: item.name,
            requested: item.quantity,
            available,
            isOverStock: item.quantity > available,
        };
    });

    return callFakeApi(results, 500);
}