import { createServer } from 'node:http';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scrypt = promisify(scryptCallback);
const serverDirectory = dirname(fileURLToPath(import.meta.url));
const storePath = join(serverDirectory, 'data', 'store.json');
const bikesPath = join(serverDirectory, '..', 'src', 'data', 'bikes.json');
const sessions = new Map();
const sessionCookie = 'bikeshop_session';
const sessionDuration = 30 * 24 * 60 * 60 * 1000;

class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

let store;

async function hashPassword(password, salt = randomBytes(16).toString('hex')) {
    const hash = await scrypt(password, salt, 64);
    return { salt, hash: hash.toString('hex') };
}

async function initializeStore() {
    try {
        store = JSON.parse(await readFile(storePath, 'utf8'));
        if (!Array.isArray(store.bikes) || !Array.isArray(store.users)
            || !Array.isArray(store.orders) || !store.carts || typeof store.carts !== 'object' || Array.isArray(store.carts)) {
            throw new Error('Dữ liệu server/data/store.json không đúng cấu trúc.');
        }
        return;
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }

    const bikes = JSON.parse(await readFile(bikesPath, 'utf8'));
    const demoAccounts = [
        { id: 'usr-default-01', name: 'Trần Lê Phúc An', email: 'an.tran@example.com', password: 'password123', role: 'Thành viên VIP' },
        { id: 'usr-default-02', name: 'Khách hàng Demo', email: 'demo@bikeshop.vn', password: 'password123', role: 'Khách hàng thân thiết' },
    ];
    const users = await Promise.all(demoAccounts.map(async (account) => {
        const { salt, hash } = await hashPassword(account.password);
        return {
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role,
            createdAt: new Date().toISOString(),
            passwordSalt: salt,
            passwordHash: hash,
        };
    }));

    store = { bikes, users, carts: {}, orders: [] };
    await saveStore();
}

async function saveStore() {
    await mkdir(dirname(storePath), { recursive: true });
    const tempPath = `${storePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(store, null, 2), 'utf8');
    await rename(tempPath, storePath);
}

function send(response, status, data, headers = {}) {
    response.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        ...headers,
    });
    response.end(JSON.stringify(data));
}

async function readBody(request) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > 1024 * 1024) throw new ApiError(413, 'Nội dung gửi lên quá lớn.');
        chunks.push(chunk);
    }
    if (!size) return {};
    try {
        return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
        throw new ApiError(400, 'Dữ liệu JSON gửi lên không hợp lệ.');
    }
}

function getCookie(request, name) {
    const cookieHeader = request.headers.cookie || '';
    const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : '';
}

function getSessionUser(request) {
    const token = getCookie(request, sessionCookie);
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
        if (token) sessions.delete(token);
        return null;
    }
    return store.users.find((user) => user.id === session.userId) || null;
}

function getCartOwner(request, user) {
    if (user) return `user:${user.id}`;
    const guestId = request.headers['x-guest-id'];
    if (typeof guestId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(guestId)) {
        throw new ApiError(400, 'Thiếu mã giỏ hàng khách.');
    }
    return `guest:${guestId}`;
}

function mergeGuestCart(request, user) {
    const guestId = request.headers['x-guest-id'];
    if (typeof guestId !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(guestId)) return false;

    const guestOwner = `guest:${guestId}`;
    const userOwner = `user:${user.id}`;
    const guestCart = store.carts[guestOwner] || [];
    if (guestCart.length === 0) return false;

    const userCart = store.carts[userOwner] || [];
    for (const guestLine of guestCart) {
        const bike = store.bikes.find((item) => item.id === guestLine.id);
        if (!bike) continue;
        const existing = userCart.find((item) => item.id === guestLine.id);
        const quantity = Math.min(bike.stock, (existing?.quantity || 0) + guestLine.quantity);
        if (existing) existing.quantity = quantity;
        else userCart.push({ id: guestLine.id, quantity });
    }

    store.carts[userOwner] = userCart;
    delete store.carts[guestOwner];
    return true;
}

function publicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}

function getCartItems(owner) {
    const lines = store.carts[owner] || [];
    return lines.flatMap((line) => {
        const bike = store.bikes.find((item) => item.id === line.id);
        return bike ? [{ ...bike, quantity: line.quantity }] : [];
    });
}

function sessionCookieHeader(token, clear = false) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    if (clear) return `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
    return `${sessionCookie}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionDuration / 1000}${secure}`;
}

async function handleRequest(request, response) {
    const url = new URL(request.url, 'http://localhost');
    const path = url.pathname;
    const method = request.method || 'GET';
    const user = getSessionUser(request);

    if (method === 'GET' && path === '/api/health') {
        send(response, 200, { ok: true });
        return;
    }

    if (method === 'GET' && path === '/api/bikes') {
        send(response, 200, { bikes: store.bikes });
        return;
    }

    const bikeMatch = path.match(/^\/api\/bikes\/([^/]+)$/);
    if (method === 'GET' && bikeMatch) {
        const bike = store.bikes.find((item) => item.id === decodeURIComponent(bikeMatch[1]));
        send(response, bike ? 200 : 404, bike ? { bike } : { error: 'Không tìm thấy xe.' });
        return;
    }

    if (method === 'GET' && path === '/api/auth/me') {
        send(response, 200, { user: user ? publicUser(user) : null });
        return;
    }

    if (method === 'POST' && path === '/api/auth/import-users') {
        const body = await readBody(request);
        if (!Array.isArray(body.users) || body.users.length > 250) {
            send(response, 400, { error: 'Danh sách tài khoản cũ không hợp lệ.' });
            return;
        }
        let imported = 0;
        for (const legacyUser of body.users) {
            const name = typeof legacyUser?.name === 'string' ? legacyUser.name.trim() : '';
            const email = typeof legacyUser?.email === 'string' ? legacyUser.email.trim().toLowerCase() : '';
            const password = typeof legacyUser?.password === 'string' ? legacyUser.password : '';
            if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6 || password.length > 256) {
                continue;
            }
            if (store.users.some((account) => account.email.toLowerCase() === email)) continue;

            const { salt, hash } = await hashPassword(password);
            if (store.users.some((account) => account.email.toLowerCase() === email)) continue;
            store.users.push({
                id: `usr-${randomBytes(10).toString('hex')}`,
                name,
                email,
                role: 'Thành viên',
                createdAt: typeof legacyUser.createdAt === 'string' ? legacyUser.createdAt : new Date().toISOString(),
                passwordSalt: salt,
                passwordHash: hash,
            });
            imported += 1;
        }
        if (imported > 0) await saveStore();
        send(response, 200, { imported });
        return;
    }

    if (method === 'POST' && path === '/api/auth/register') {
        const body = await readBody(request);
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 6) {
            send(response, 400, { error: 'Thông tin đăng ký chưa hợp lệ.' });
            return;
        }
        if (store.users.some((account) => account.email.toLowerCase() === email)) {
            send(response, 409, { error: 'Email này đã được đăng ký.' });
            return;
        }

        const { salt, hash } = await hashPassword(password);
        if (store.users.some((account) => account.email.toLowerCase() === email)) {
            send(response, 409, { error: 'Email này đã được đăng ký.' });
            return;
        }
        const newUser = {
            id: `usr-${randomBytes(10).toString('hex')}`,
            name,
            email,
            role: 'Thành viên mới',
            createdAt: new Date().toISOString(),
            passwordSalt: salt,
            passwordHash: hash,
        };
        store.users.push(newUser);
        mergeGuestCart(request, newUser);
        await saveStore();
        const token = randomBytes(32).toString('hex');
        sessions.set(token, { userId: newUser.id, expiresAt: Date.now() + sessionDuration });
        send(response, 201, { user: publicUser(newUser) }, { 'Set-Cookie': sessionCookieHeader(token) });
        return;
    }

    if (method === 'POST' && path === '/api/auth/login') {
        const body = await readBody(request);
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const account = store.users.find((item) => item.email.toLowerCase() === email);
        if (!account || !password) {
            send(response, 401, { error: 'Email hoặc mật khẩu không chính xác.' });
            return;
        }
        const { hash } = await hashPassword(password, account.passwordSalt);
        const expected = Buffer.from(account.passwordHash, 'hex');
        const actual = Buffer.from(hash, 'hex');
        if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
            send(response, 401, { error: 'Email hoặc mật khẩu không chính xác.' });
            return;
        }
        const token = randomBytes(32).toString('hex');
        sessions.set(token, { userId: account.id, expiresAt: Date.now() + sessionDuration });
        if (mergeGuestCart(request, account)) await saveStore();
        send(response, 200, { user: publicUser(account) }, { 'Set-Cookie': sessionCookieHeader(token) });
        return;
    }

    if (method === 'POST' && path === '/api/auth/demo') {
        const account = store.users.find((item) => item.id === 'usr-default-01');
        if (!account) {
            send(response, 404, { error: 'Không tìm thấy tài khoản demo.' });
            return;
        }
        const token = randomBytes(32).toString('hex');
        sessions.set(token, { userId: account.id, expiresAt: Date.now() + sessionDuration });
        send(response, 200, { user: publicUser(account) }, { 'Set-Cookie': sessionCookieHeader(token) });
        return;
    }

    if (method === 'POST' && path === '/api/auth/logout') {
        sessions.delete(getCookie(request, sessionCookie));
        send(response, 200, { ok: true }, { 'Set-Cookie': sessionCookieHeader('', true) });
        return;
    }

    if (method === 'GET' && path === '/api/orders/me') {
        const orders = user
            ? store.orders.filter((order) => order.userId === user.id)
            : [];
        send(response, 200, { orders });
        return;
    }

    if (method === 'POST' && path === '/api/orders/import-legacy') {
        const body = await readBody(request);
        if (!Array.isArray(body.orders) || body.orders.length > 500) {
            send(response, 400, { error: 'Danh sách đơn hàng cũ không hợp lệ.' });
            return;
        }
        let imported = 0;
        let handled = 0;
        for (const legacyOrder of body.orders) {
            const email = typeof legacyOrder?.userEmail === 'string' ? legacyOrder.userEmail.toLowerCase() : '';
            const account = store.users.find((item) => item.email.toLowerCase() === email);
            if (!account || !Array.isArray(legacyOrder.items) || !legacyOrder.items.length) continue;
            if (store.orders.some((item) => item.id === legacyOrder.id)) {
                handled += 1;
                continue;
            }

            const items = legacyOrder.items.filter((item) =>
                item && typeof item.id === 'string' && typeof item.name === 'string'
                && Number.isSafeInteger(item.price) && item.price >= 0
                && Number.isSafeInteger(item.quantity) && item.quantity > 0
            ).map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image || '' }));
            if (items.length === 0) continue;

            const subtotal = Number.isSafeInteger(legacyOrder.subtotal)
                ? legacyOrder.subtotal
                : items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shipping = Number.isSafeInteger(legacyOrder.shipping) ? legacyOrder.shipping : 0;
            const discount = Number.isSafeInteger(legacyOrder.discount) ? legacyOrder.discount : 0;
            const statusOptions = ['Đã tiếp nhận', 'Đang chuẩn bị', 'Đang vận chuyển', 'Giao hàng thành công'];
            store.orders.push({
                id: typeof legacyOrder.id === 'string' ? legacyOrder.id : `DH-CU-${randomBytes(5).toString('hex')}`,
                createdAt: typeof legacyOrder.createdAt === 'string' ? legacyOrder.createdAt : new Date().toISOString(),
                userId: account.id,
                userEmail: account.email,
                recipient: legacyOrder.recipient && typeof legacyOrder.recipient === 'object'
                    ? legacyOrder.recipient
                    : { name: account.name, phone: '', email: account.email, address: '' },
                items,
                subtotal,
                discount,
                shipping,
                total: Number.isSafeInteger(legacyOrder.total) ? legacyOrder.total : Math.max(0, subtotal - discount + shipping),
                couponCode: typeof legacyOrder.couponCode === 'string' ? legacyOrder.couponCode : '',
                deliveryMethod: legacyOrder.deliveryMethod === 'express' ? 'express' : 'standard',
                paymentMethod: ['cod', 'qr', 'card'].includes(legacyOrder.paymentMethod) ? legacyOrder.paymentMethod : 'cod',
                status: statusOptions.includes(legacyOrder.status) ? legacyOrder.status : 'Đã tiếp nhận',
            });
            imported += 1;
            handled += 1;
        }
        if (imported > 0) await saveStore();
        send(response, 200, { imported, handled });
        return;
    }

    if (path !== '/api/cart' && !path.startsWith('/api/cart/') && path !== '/api/orders') {
        send(response, 404, { error: 'Không tìm thấy API.' });
        return;
    }

    const owner = getCartOwner(request, user);
    if (method === 'GET' && path === '/api/cart') {
        send(response, 200, { items: getCartItems(owner) });
        return;
    }

    if (method === 'POST' && path === '/api/cart/items') {
        const body = await readBody(request);
        const bike = store.bikes.find((item) => item.id === body.bikeId);
        const quantity = body.quantity ?? 1;
        if (!bike || !Number.isSafeInteger(quantity) || quantity < 1) {
            send(response, 400, { error: 'Sản phẩm hoặc số lượng không hợp lệ.' });
            return;
        }
        const cart = store.carts[owner] || [];
        const current = cart.find((item) => item.id === bike.id);
        if ((current?.quantity || 0) + quantity > bike.stock) {
            send(response, 409, { error: `Sản phẩm "${bike.name}" không đủ tồn kho.` });
            return;
        }
        if (current) current.quantity += quantity;
        else cart.push({ id: bike.id, quantity });
        store.carts[owner] = cart;
        await saveStore();
        send(response, 200, { items: getCartItems(owner) });
        return;
    }

    const cartItemMatch = path.match(/^\/api\/cart\/items\/([^/]+)$/);
    if (cartItemMatch && method === 'PUT') {
        const body = await readBody(request);
        const id = decodeURIComponent(cartItemMatch[1]);
        const line = (store.carts[owner] || []).find((item) => item.id === id);
        const bike = store.bikes.find((item) => item.id === id);
        if (!line || !bike || !Number.isSafeInteger(body.quantity) || body.quantity < 1) {
            send(response, 400, { error: 'Số lượng không hợp lệ.' });
            return;
        }
        if (body.quantity > bike.stock) {
            send(response, 409, { error: `Sản phẩm "${bike.name}" không đủ tồn kho.` });
            return;
        }
        line.quantity = body.quantity;
        await saveStore();
        send(response, 200, { items: getCartItems(owner) });
        return;
    }

    if (cartItemMatch && method === 'DELETE') {
        const id = decodeURIComponent(cartItemMatch[1]);
        store.carts[owner] = (store.carts[owner] || []).filter((item) => item.id !== id);
        await saveStore();
        send(response, 200, { items: getCartItems(owner) });
        return;
    }

    if (method === 'DELETE' && path === '/api/cart') {
        store.carts[owner] = [];
        await saveStore();
        send(response, 200, { items: [] });
        return;
    }

    if (method === 'POST' && path === '/api/orders') {
        const body = await readBody(request);
        const items = Array.isArray(body.items) ? body.items : [];
        const recipient = body.recipient;
        if (!items.length || !recipient || Object.values(recipient).some((value) => typeof value !== 'string' || !value.trim())) {
            send(response, 400, { error: 'Thông tin đơn hàng hoặc người nhận chưa đầy đủ.' });
            return;
        }
        if (!['standard', 'express'].includes(body.deliveryMethod) || !['cod', 'qr', 'card'].includes(body.paymentMethod)) {
            send(response, 400, { error: 'Phương thức giao hàng hoặc thanh toán không hợp lệ.' });
            return;
        }
        const couponCode = String(body.couponCode || '').trim().toUpperCase();
        if (couponCode && !['BIKE10', 'FREESHIP'].includes(couponCode)) {
            send(response, 400, { error: 'Mã giảm giá không hợp lệ.' });
            return;
        }

        const cart = store.carts[owner] || [];
        const orderItems = [];
        for (const requested of items) {
            const line = cart.find((item) => item.id === requested.id);
            const bike = store.bikes.find((item) => item.id === requested.id);
            if (!line || !bike || !Number.isSafeInteger(requested.quantity) || requested.quantity < 1 || requested.quantity > line.quantity) {
                send(response, 400, { error: `Sản phẩm "${requested.name || requested.id}" không còn trong giỏ hàng.` });
                return;
            }
            if (requested.quantity > bike.stock) {
                send(response, 409, { error: `Sản phẩm "${bike.name}" không đủ tồn kho.` });
                return;
            }
            orderItems.push({ id: bike.id, name: bike.name, price: bike.price, quantity: requested.quantity, image: bike.image });
        }

        const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = couponCode === 'BIKE10' ? Math.round(subtotal * 0.1) : 0;
        const shipping = couponCode === 'FREESHIP' ? 0 : (body.deliveryMethod === 'express' ? 300000 : 150000);
        const order = {
            id: `DH-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`,
            createdAt: new Date().toISOString(),
            userId: user?.id ?? null,
            userEmail: user?.email ?? null,
            recipient,
            items: orderItems,
            subtotal,
            discount,
            shipping,
            total: Math.max(0, subtotal - discount + shipping),
            couponCode,
            deliveryMethod: body.deliveryMethod,
            paymentMethod: body.paymentMethod,
            status: 'Đã tiếp nhận',
        };

        const previousStore = JSON.stringify(store);
        for (const item of orderItems) {
            const bike = store.bikes.find((candidate) => candidate.id === item.id);
            bike.stock -= item.quantity;
            const line = cart.find((candidate) => candidate.id === item.id);
            line.quantity -= item.quantity;
        }
        store.carts[owner] = cart.filter((item) => item.quantity > 0);
        store.orders.unshift(order);
        try {
            await saveStore();
        } catch (error) {
            store = JSON.parse(previousStore);
            throw error;
        }
        send(response, 201, { order, cart: getCartItems(owner) });
        return;
    }

    send(response, 404, { error: 'Không tìm thấy API.' });
}

const server = createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
        console.error(error);
        const status = error instanceof ApiError ? error.status : 500;
        send(response, status, { error: error.message || 'Có lỗi xảy ra ở máy chủ.' });
    });
});

await initializeStore();
const port = Number(process.env.API_PORT) || 3001;
server.listen(port, '127.0.0.1', () => {
    console.log(`BikeShop API đang chạy tại http://127.0.0.1:${port}`);
});
