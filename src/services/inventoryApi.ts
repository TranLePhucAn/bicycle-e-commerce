import { apiRequest } from './apiClient';

export interface StockCheckResult {
    id: string;
    name: string;
    requested: number;
    available: number;
    isOverStock: boolean;
}

export async function checkCartStock(items: { id: string; name: string; quantity: number }[]) {
    const { bikes } = await apiRequest<{ bikes: { id: string; stock: number }[] }>('/api/bikes');
    const stockMap = new Map(bikes.map((bike) => [bike.id, bike.stock]));

    const results: StockCheckResult[] = items.map((item) => {
        const available = stockMap.get(item.id) ?? 0;

        return {
            id: item.id,
            name: item.name,
            requested: item.quantity,
            available,
            isOverStock: item.quantity > available,
        };
    });

    return results;
}
