export interface BikeColor {
    name?: string;
}

export interface Bike {
    id: string;
    name: string;
    brand: string;
    category: string | string[];
    frameSize?: string[];
    image: string;
    images?: string[];
    colors?: Array<string | BikeColor>;
    color?: string;
    price: number;
    stock: number;
    status?: string;
    description?: string;
    discount?: number;
    originalPrice?: number;
    [key: string]: unknown;
}

export function loadBikes(): Promise<Bike[]>;
export function getBikeById(id: string): Promise<Bike | null>;
export function getBikeCategories(): Promise<Array<string | string[]>>;
export function getBikesByCategory(category: string): Promise<Bike[]>;
export function getBikesGroupedByCategory(): Promise<Record<string, Bike[]>>;
