import { callFakeApi } from './fakeApi';
import type { Address } from '../context/AuthContext';

const USERS_KEY = 'bikeshop_users';

function readUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
}

function writeUsers(users: any[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function getAddresses(userId: string) {
    const users = readUsers();
    const found = users.find((u: any) => u.id === userId);
    return callFakeApi(found?.addresses ?? [], 400);
}

export async function addAddress(userId: string, address: Omit<Address, 'id'>) {
    const users = readUsers();
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('Không tìm thấy tài khoản.');

    const newAddress: Address = { ...address, id: `addr-${Date.now()}` };
    if (!users[idx].addresses) users[idx].addresses = [];

    if (newAddress.isDefault) {
        users[idx].addresses.forEach((a: Address) => (a.isDefault = false));
    }
    users[idx].addresses.push(newAddress);
    writeUsers(users);

    return callFakeApi(newAddress, 500);
}