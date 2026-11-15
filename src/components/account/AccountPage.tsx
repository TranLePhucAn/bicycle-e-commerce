import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    getUserAddresses,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    formatFullAddress,
    type AddressItem,
} from '../../services/addressService';

interface AccountPageProps {
    onGoHome: () => void;
}

export default function AccountPage({ onGoHome }: AccountPageProps) {
    const { user, updateProfile, changePassword } = useAuth();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'password'>('profile');

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Address State
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
    const [addrForm, setAddrForm] = useState({
        fullName: '',
        phone: '',
        province: '',
        district: '',
        ward: '',
        streetAddress: '',
        isDefault: false,
    });

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setAddresses(getUserAddresses(user.id));
        }
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast('Vui lòng nhập họ và tên!', 'warning');
            return;
        }
        setIsSavingProfile(true);
        const result = await updateProfile({ name: name.trim(), phone: phone.trim() });
        setIsSavingProfile(false);
        showToast(result.message, result.success ? 'success' : 'danger');
    };

    const handleOpenAddAddress = () => {
        setEditingAddressId(null);
        setAddrForm({
            fullName: user?.name || '',
            phone: user?.phone || '',
            province: 'TP. Hồ Chí Minh',
            district: '',
            ward: '',
            streetAddress: '',
            isDefault: addresses.length === 0,
        });
        setShowAddressModal(true);
    };

    const handleOpenEditAddress = (addr: AddressItem) => {
        setEditingAddressId(addr.id);
        setAddrForm({
            fullName: addr.fullName,
            phone: addr.phone,
            province: addr.province,
            district: addr.district,
            ward: addr.ward,
            streetAddress: addr.streetAddress,
            isDefault: addr.isDefault,
        });
        setShowAddressModal(true);
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            saveAddress(user.id, addrForm, editingAddressId || undefined);
            setAddresses(getUserAddresses(user.id));
            setShowAddressModal(false);
            showToast(editingAddressId ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!', 'success');
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Lỗi khi lưu địa chỉ.', 'danger');
        }
    };

    const handleDeleteAddress = (id: string) => {
        if (!user || !window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
        deleteAddress(user.id, id);
        setAddresses(getUserAddresses(user.id));
        showToast('Đã xóa địa chỉ thành công.', 'info');
    };

    const handleSetDefaultAddress = (id: string) => {
        if (!user) return;
        setDefaultAddress(user.id, id);
        setAddresses(getUserAddresses(user.id));
        showToast('Đã đổi địa chỉ mặc định!', 'success');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oldPassword) {
            showToast('Vui lòng nhập mật khẩu hiện tại!', 'warning');
            return;
        }
        if (newPassword.length < 6) {
            showToast('Mật khẩu mới phải từ 6 ký tự trở lên!', 'warning');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('Xác nhận mật khẩu mới không khớp!', 'warning');
            return;
        }
        setIsChangingPass(true);
        const result = await changePassword(oldPassword, newPassword);
        setIsChangingPass(false);
        showToast(result.message, result.success ? 'success' : 'danger');
        if (result.success) {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <section className="container py-5">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 flex-wrap gap-2">
                <div>
                    <h3 className="fw-bold text-dark m-0">
                        <i className="fa-solid fa-user-circle me-2 text-primary"></i>
                        Quản Lý Tài Khoản
                    </h3>
                    <small className="text-muted">
                        Chào bạn, <strong className="text-dark">{user?.name}</strong> ({user?.email})
                    </small>
                </div>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={onGoHome}>
                    <i className="fa-solid fa-arrow-left me-2"></i>Về trang chủ
                </button>
            </div>

            <div className="row g-4">
                {/* Sidebar menu */}
                <div className="col-12 col-md-4 col-lg-3">
                    <div className="list-group shadow-sm rounded-3">
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 ${
                                activeTab === 'profile' ? 'active bg-dark border-dark text-white' : ''
                            }`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <i className="fa-solid fa-id-card"></i>
                            <span>Hồ sơ cá nhân</span>
                        </button>
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between py-3 ${
                                activeTab === 'addresses' ? 'active bg-dark border-dark text-white' : ''
                            }`}
                            onClick={() => setActiveTab('addresses')}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <i className="fa-solid fa-map-location-dot"></i>
                                <span>Sổ địa chỉ</span>
                            </div>
                            <span className={`badge rounded-pill ${activeTab === 'addresses' ? 'bg-light text-dark' : 'bg-primary'}`}>
                                {addresses.length}
                            </span>
                        </button>
                        <button
                            type="button"
                            className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 ${
                                activeTab === 'password' ? 'active bg-dark border-dark text-white' : ''
                            }`}
                            onClick={() => setActiveTab('password')}
                        >
                            <i className="fa-solid fa-key"></i>
                            <span>Đổi mật khẩu</span>
                        </button>
                    </div>
                </div>

                {/* Content Panel */}
                <div className="col-12 col-md-8 col-lg-9">
                    {/* Tab 1: Hồ sơ */}
                    {activeTab === 'profile' && (
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white py-3 border-bottom">
                                <h5 className="fw-bold m-0 text-dark">Thông Tin Cá Nhân</h5>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSaveProfile}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Họ và tên</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Email đăng nhập</label>
                                        <input
                                            type="email"
                                            className="form-control bg-light"
                                            value={user?.email || ''}
                                            disabled
                                        />
                                        <small className="text-muted">Email là định danh tài khoản, không thể thay đổi.</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            placeholder="Ví dụ: 0912345678"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Hạng thành viên</label>
                                        <div>
                                            <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                                                <i className="fa-solid fa-crown me-1"></i> {user?.role || 'Thành viên'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-dark px-4 fw-semibold"
                                        disabled={isSavingProfile}
                                    >
                                        {isSavingProfile ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Sổ địa chỉ */}
                    {activeTab === 'addresses' && (
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                                <div>
                                    <h5 className="fw-bold m-0 text-dark">Sổ Địa Chỉ Giao Hàng</h5>
                                    <small className="text-muted">Địa chỉ mặc định sẽ tự động điền khi thanh toán</small>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm fw-semibold"
                                    onClick={handleOpenAddAddress}
                                >
                                    <i className="fa-solid fa-plus me-1"></i> Thêm Địa Chỉ Mới
                                </button>
                            </div>
                            <div className="card-body p-4">
                                {addresses.length === 0 ? (
                                    <div className="text-center py-5 text-muted">
                                        <i className="fa-solid fa-location-dot fs-1 mb-3 opacity-25"></i>
                                        <p>Bạn chưa lưu địa chỉ nhận hàng nào.</p>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={handleOpenAddAddress}
                                        >
                                            Thêm địa chỉ ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column gap-3">
                                        {addresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                className={`p-3 border rounded-3 position-relative ${
                                                    addr.isDefault ? 'border-primary bg-primary-subtle bg-opacity-10' : 'bg-white'
                                                }`}
                                            >
                                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                                                    <div>
                                                        <strong className="text-dark fs-6 me-2">{addr.fullName}</strong>
                                                        <span className="text-muted">| {addr.phone}</span>
                                                        {addr.isDefault && (
                                                            <span className="badge bg-primary ms-2">Mặc định</span>
                                                        )}
                                                    </div>
                                                    <div className="d-flex gap-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary btn-sm"
                                                            onClick={() => handleOpenEditAddress(addr)}
                                                        >
                                                            Sửa
                                                        </button>
                                                        {!addr.isDefault && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-primary btn-sm"
                                                                    onClick={() => handleSetDefaultAddress(addr.id)}
                                                                >
                                                                    Đặt mặc định
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm"
                                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-secondary mb-0 small">
                                                    <i className="fa-solid fa-map-pin me-1 text-danger"></i>
                                                    {formatFullAddress(addr)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Đổi mật khẩu */}
                    {activeTab === 'password' && (
                        <div className="card border-0 shadow-sm rounded-3">
                            <div className="card-header bg-white py-3 border-bottom">
                                <h5 className="fw-bold m-0 text-dark">Đổi Mật Khẩu</h5>
                            </div>
                            <div className="card-body p-4" style={{ maxWidth: '480px' }}>
                                <form onSubmit={handleChangePassword}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Mật khẩu hiện tại</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Nhập mật khẩu cũ..."
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Ít nhất 6 ký tự..."
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Nhập lại mật khẩu mới..."
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-dark px-4 fw-semibold"
                                        disabled={isChangingPass}
                                    >
                                        {isChangingPass ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Thêm/Sửa Địa chỉ */}
            {showAddressModal && (
                <div
                    className="modal show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">
                                    {editingAddressId ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowAddressModal(false)}
                                ></button>
                            </div>
                            <form onSubmit={handleSaveAddress}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Họ và tên người nhận</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={addrForm.fullName}
                                            onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Số điện thoại nhận hàng</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={addrForm.phone}
                                            onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="row g-2 mb-3">
                                        <div className="col-12 col-md-4">
                                            <label className="form-label small fw-semibold">Tỉnh/Thành</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addrForm.province}
                                                onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
                                                placeholder="VD: TP. Hồ Chí Minh"
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label small fw-semibold">Quận/Huyện</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addrForm.district}
                                                onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })}
                                                placeholder="VD: Quận 1"
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label small fw-semibold">Phường/Xã</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={addrForm.ward}
                                                onChange={(e) => setAddrForm({ ...addrForm, ward: e.target.value })}
                                                placeholder="VD: P. Bến Nghé"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Số nhà, tên đường</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={addrForm.streetAddress}
                                            onChange={(e) => setAddrForm({ ...addrForm, streetAddress: e.target.value })}
                                            placeholder="VD: 123 Nguyễn Huệ"
                                            required
                                        />
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="addr-default-check"
                                            checked={addrForm.isDefault}
                                            onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                                        />
                                        <label className="form-check-label small" htmlFor="addr-default-check">
                                            Đặt làm địa chỉ nhận hàng mặc định
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary btn-sm"
                                        onClick={() => setShowAddressModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary btn-sm px-4">
                                        Lưu Địa Chỉ
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
