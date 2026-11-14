export interface AddressItem {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    streetAddress: string;
    isDefault: boolean;
}

const ADDRESSES_STORAGE_KEY = 'bikeshop_addresses';

function readAddresses(): AddressItem[] {
    try {
        const raw = localStorage.getItem(ADDRESSES_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeAddresses(addresses: AddressItem[]): void {
    localStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
}

export function getUserAddresses(userId: string): AddressItem[] {
    if (!userId) return [];
    const all = readAddresses();
    return all.filter((addr) => addr.userId === userId);
}

export function getDefaultAddress(userId?: string | null): AddressItem | null {
    if (!userId) return null;
    const userAddresses = getUserAddresses(userId);
    if (userAddresses.length === 0) return null;
    return userAddresses.find((addr) => addr.isDefault) || userAddresses[0];
}

export function formatFullAddress(addr: AddressItem): string {
    const parts = [addr.streetAddress, addr.ward, addr.district, addr.province].filter(Boolean);
    return parts.join(', ');
}

export function saveAddress(
    userId: string,
    data: Omit<AddressItem, 'id' | 'userId' | 'isDefault'> & { isDefault?: boolean },
    editId?: string
): AddressItem {
    if (!userId) throw new Error('Vui lòng đăng nhập để lưu địa chỉ.');
    if (!data.fullName.trim()) throw new Error('Họ và tên không được để trống.');
    if (!data.phone.trim()) throw new Error('Số điện thoại không được để trống.');
    if (!data.streetAddress.trim()) throw new Error('Địa chỉ cụ thể không được để trống.');

    const all = readAddresses();
    const existingUserAddrs = all.filter((a) => a.userId === userId);
    const shouldBeDefault = data.isDefault || existingUserAddrs.length === 0;

    let updatedList = all;
    let savedItem: AddressItem;

    if (shouldBeDefault) {
        // Unset other defaults for this user
        updatedList = updatedList.map((a) => a.userId === userId ? { ...a, isDefault: false } : a);
    }

    if (editId) {
        const index = updatedList.findIndex((a) => a.id === editId && a.userId === userId);
        if (index === -1) throw new Error('Không tìm thấy địa chỉ để cập nhật.');
        savedItem = {
            ...updatedList[index],
            ...data,
            isDefault: shouldBeDefault,
        };
        updatedList[index] = savedItem;
    } else {
        savedItem = {
            id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            userId,
            fullName: data.fullName.trim(),
            phone: data.phone.trim(),
            province: data.province.trim(),
            district: data.district.trim(),
            ward: data.ward.trim(),
            streetAddress: data.streetAddress.trim(),
            isDefault: shouldBeDefault,
        };
        updatedList.push(savedItem);
    }

    writeAddresses(updatedList);
    return savedItem;
}

export function deleteAddress(userId: string, addressId: string): void {
    const all = readAddresses();
    const target = all.find((a) => a.id === addressId && a.userId === userId);
    if (!target) return;

    let updatedList = all.filter((a) => !(a.id === addressId && a.userId === userId));

    // If we deleted the default, set another address as default
    if (target.isDefault) {
        const remaining = updatedList.filter((a) => a.userId === userId);
        if (remaining.length > 0) {
            remaining[0].isDefault = true;
        }
    }

    writeAddresses(updatedList);
}

export function setDefaultAddress(userId: string, addressId: string): void {
    const all = readAddresses();
    const updated = all.map((a) => {
        if (a.userId !== userId) return a;
        return {
            ...a,
            isDefault: a.id === addressId,
        };
    });
    writeAddresses(updated);
}
