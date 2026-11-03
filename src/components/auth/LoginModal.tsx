import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginModal() {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const { showToast } = useToast();

    const [email, setEmail] = useState('an.tran@example.com');
    const [password, setPassword] = useState('123456');

    if (!isLoginModalOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            showToast('Vui lòng nhập đầy đủ Email và Mật khẩu!', 'warning');
            return;
        }

        login(email, 'Trần Lê Phúc An');
        showToast('Đăng nhập thành công!', 'success');
    };

    const handleQuickLogin = () => {
        login('an.tran@example.com', 'Trần Lê Phúc An');
        showToast('Đăng nhập thành công!', 'success');
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1050 }}
            role="dialog"
            aria-modal="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow overflow-hidden">
                    <div className="modal-header bg-dark text-white py-3 px-4">
                        <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">🚲</span>
                            <h5 className="modal-title fw-bold m-0">Đăng Nhập Tài Khoản</h5>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={closeLoginModal}
                            aria-label="Close"
                        ></button>
                    </div>

                    <div className="modal-body p-4">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-secondary">Địa chỉ Email</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-regular fa-envelope text-muted"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-semibold text-secondary">Mật khẩu</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fa-solid fa-lock text-muted"></i>
                                    </span>
                                    <input
                                        type="password"
                                        className="form-control border-start-0"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2 fw-semibold rounded-3 mb-2"
                            >
                                Đăng Nhập
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-success w-100 py-2 fw-semibold rounded-3"
                                onClick={handleQuickLogin}
                            >
                                Đăng Nhập Nhanh
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
