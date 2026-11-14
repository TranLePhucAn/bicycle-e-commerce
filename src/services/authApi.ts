import { callFakeApi } from './fakeApi';

const USERS_KEY = 'bikeshop_users';

export async function changePassword(userId: string, oldPassword: string, newPassword: string) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx === -1) throw new Error('Không tìm thấy tài khoản.');
    if (users[idx].password !== oldPassword) throw new Error('Mật khẩu hiện tại không đúng.');

    users[idx].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return callFakeApi({ success: true }, 600);
}