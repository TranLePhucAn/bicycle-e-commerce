const GUEST_ID_KEY = 'bikeshop_guest_id';

function getGuestId() {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    const hasBody = options.body !== undefined;
    if (hasBody && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    if (path.startsWith('/api/cart') || path.startsWith('/api/auth/') || path === '/api/orders') {
        headers.set('X-Guest-Id', getGuestId());
    }

    const response = await fetch(path, {
        ...options,
        headers,
        credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || `Yêu cầu API thất bại (${response.status}).`);
    }
    return data as T;
}
