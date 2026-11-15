import React, { useState, useEffect } from 'react';
import { useAuth, type AuthModalMode } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function LoginModal() {
    const {
        isLoginModalOpen,
        closeLoginModal,
        authModalMode,
        setAuthModalMode,
        login,
        quickLogin,
        register,
    } = useAuth();
    const { showToast } = useToast();

    // State cho Đăng Nhập
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

    // State cho Đăng Ký
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [regErrors, setRegErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    // Hiển thị/Ẩn mật khẩu
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    // Reset lỗi khi chuyển tab hoặc mở modal
    useEffect(() => {
        setLoginErrors({});
        setRegErrors({});
    }, [authModalMode, isLoginModalOpen]);

    if (!isLoginModalOpen) return null;

    // Validate form Đăng Nhập
    const validateLoginForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        const email = loginEmail.trim();
        if (!email) {
            errors.email = 'Vui lòng nhập địa chỉ Email.';
        } else if (!EMAIL_REGEX.test(email)) {
            errors.email = 'Định dạng email không hợp lệ (ví dụ: name@example.com).';
        }

        if (!loginPassword) {
            errors.password = 'Vui lòng nhập mật khẩu.';
        }

        setLoginErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate form Đăng Ký
    const validateRegisterForm = (): boolean => {
        const errors: {
            name?: string;
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        const name = regName.trim();
        if (!name) {
            errors.name = 'Vui lòng nhập họ và tên của bạn.';
        } else if (name.length < 2) {
            errors.name = 'Họ và tên phải có ít nhất 2 ký tự.';
        }

        const email = regEmail.trim();
        if (!email) {
            errors.email = 'Vui lòng nhập địa chỉ Email.';
        } else if (!EMAIL_REGEX.test(email)) {
            errors.email = 'Định dạng email không hợp lệ (ví dụ: name@example.com).';
        }

        if (!regPassword) {
            errors.password = 'Vui lòng nhập mật khẩu.';
        } else if (regPassword.length < 6) {
            errors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
        }

        if (!regConfirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.';
        } else if (regConfirmPassword !== regPassword) {
            errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp.';
        }

        setRegErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Xử lý nộp form Đăng Nhập
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateLoginForm()) {
            showToast('Vui lòng kiểm tra lại thông tin đăng nhập!', 'warning');
            return;
        }

        const res = await login(loginEmail, loginPassword);
        if (res.success) {
            showToast(res.message, 'success');
        } else {
            showToast(res.message, 'danger');
            setLoginErrors((prev) => ({ ...prev, password: res.message }));
        }
    };

    // Xử lý nộp form Đăng Ký
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateRegisterForm()) {
            showToast('Vui lòng hoàn thiện đúng các trường thông tin!', 'warning');
            return;
        }

        const res = await register({
            name: regName,
            email: regEmail,
            password: regPassword,
        });

        if (res.success) {
            showToast(res.message, 'success');
            // Reset form đăng ký
            setRegName('');
            setRegEmail('');
            setRegPassword('');
            setRegConfirmPassword('');
        } else {
            showToast(res.message, 'danger');
            setRegErrors((prev) => ({ ...prev, email: res.message }));
        }
    };

    // Xử lý Đăng Nhập Nhanh (Demo)
    const handleQuickLogin = async () => {
        const res = await quickLogin();
        if (res.success) {
            showToast(res.message, 'success');
        }
    };

    const switchMode = (mode: AuthModalMode) => {
        setAuthModalMode(mode);
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1050 }}
            role="dialog"
            aria-modal="true"
        >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
                <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="modal-header text-white py-3 px-4 position-relative border-0" style={{ backgroundColor: '#1e293b' }}>
                        <div className="d-flex align-items-center gap-2">
                            <span className="fs-4">🚲</span>
                            <div>
                                <h5 className="modal-title fw-bold m-0 lh-1">
                                    {authModalMode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}
                                </h5>
                                <small className="text-light opacity-75" style={{ fontSize: '11px' }}>
                                    Hệ Thống Xe Đạp Chính Hãng BikeShop
                                </small>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={closeLoginModal}
                            aria-label="Close"
                        ></button>
                    </div>

                    {/* Tabs chuyển đổi giữa Đăng Nhập & Đăng Ký */}
                    <div className="d-flex border-bottom bg-light">
                        <button
                            type="button"
                            className={`flex-grow-1 py-3 border-0 fw-bold small text-center transition-all ${
                                authModalMode === 'login'
                                    ? 'bg-white text-primary border-bottom border-primary border-3'
                                    : 'text-muted bg-light'
                            }`}
                            onClick={() => switchMode('login')}
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="fa-solid fa-right-to-bracket me-2"></i>
                            ĐĂNG NHẬP
                        </button>
                        <button
                            type="button"
                            className={`flex-grow-1 py-3 border-0 fw-bold small text-center transition-all ${
                                authModalMode === 'register'
                                    ? 'bg-white text-primary border-bottom border-primary border-3'
                                    : 'text-muted bg-light'
                            }`}
                            onClick={() => switchMode('register')}
                            style={{ cursor: 'pointer' }}
                        >
                            <i className="fa-solid fa-user-plus me-2"></i>
                            ĐĂNG KÝ
                        </button>
                    </div>

                    <div className="modal-body p-4 bg-white">
                        {/* ===================== FORM ĐĂNG NHẬP ===================== */}
                        {authModalMode === 'login' && (
                            <form onSubmit={handleLoginSubmit} noValidate>
                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-secondary small">
                                        Địa chỉ Email <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0">
                                            <i className="fa-regular fa-envelope"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className={`form-control border-start-0 ${
                                                loginErrors.email ? 'is-invalid' : ''
                                            }`}
                                            placeholder="an.tran@example.com"
                                            value={loginEmail}
                                            onChange={(e) => {
                                                setLoginEmail(e.target.value);
                                                if (loginErrors.email) {
                                                    setLoginErrors((prev) => ({ ...prev, email: undefined }));
                                                }
                                            }}
                                        />
                                        {loginErrors.email && (
                                            <div className="invalid-feedback">{loginErrors.email}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <label className="form-label fw-semibold text-secondary small m-0">
                                            Mật khẩu <span className="text-danger">*</span>
                                        </label>
                                    </div>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0">
                                            <i className="fa-solid fa-lock"></i>
                                        </span>
                                        <input
                                            type={showLoginPassword ? 'text' : 'password'}
                                            className={`form-control border-start-0 border-end-0 ${
                                                loginErrors.password ? 'is-invalid' : ''
                                            }`}
                                            placeholder="••••••••"
                                            value={loginPassword}
                                            onChange={(e) => {
                                                setLoginPassword(e.target.value);
                                                if (loginErrors.password) {
                                                    setLoginErrors((prev) => ({ ...prev, password: undefined }));
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="input-group-text bg-light text-muted border-start-0"
                                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                                            tabIndex={-1}
                                        >
                                            <i className={`fa-regular ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                        {loginErrors.password && (
                                            <div className="invalid-feedback d-block">{loginErrors.password}</div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-semibold rounded-3 mb-2 shadow-sm"
                                >
                                    <i className="fa-solid fa-arrow-right-to-bracket me-2"></i>
                                    Đăng Nhập
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-outline-success w-100 py-2 fw-semibold rounded-3 mb-3"
                                    onClick={handleQuickLogin}
                                    title="Tự động đăng nhập với tài khoản an.tran@example.com"
                                >
                                    <i className="fa-solid fa-bolt me-2"></i>
                                    Đăng Nhập Nhanh (Demo)
                                </button>

                                <div className="text-center pt-2 border-top">
                                    <small className="text-muted">
                                        Chưa có tài khoản BikeShop?{' '}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                                            onClick={() => switchMode('register')}
                                        >
                                            Đăng ký ngay
                                        </button>
                                    </small>
                                </div>
                            </form>
                        )}

                        {/* ===================== FORM ĐĂNG KÝ ===================== */}
                        {authModalMode === 'register' && (
                            <form onSubmit={handleRegisterSubmit} noValidate>
                                {/* Họ và tên */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-secondary small">
                                        Họ và tên <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0">
                                            <i className="fa-regular fa-user"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className={`form-control border-start-0 ${
                                                regErrors.name ? 'is-invalid' : ''
                                            }`}
                                            placeholder="Nguyễn Văn A"
                                            value={regName}
                                            onChange={(e) => {
                                                setRegName(e.target.value);
                                                if (regErrors.name) {
                                                    setRegErrors((prev) => ({ ...prev, name: undefined }));
                                                }
                                            }}
                                        />
                                        {regErrors.name && (
                                            <div className="invalid-feedback">{regErrors.name}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Email (Có chặn trùng) */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-secondary small">
                                        Địa chỉ Email <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0">
                                            <i className="fa-regular fa-envelope"></i>
                                        </span>
                                        <input
                                            type="email"
                                            className={`form-control border-start-0 ${
                                                regErrors.email ? 'is-invalid' : ''
                                            }`}
                                            placeholder="name@example.com"
                                            value={regEmail}
                                            onChange={(e) => {
                                                setRegEmail(e.target.value);
                                                if (regErrors.email) {
                                                    setRegErrors((prev) => ({ ...prev, email: undefined }));
                                                }
                                            }}
                                        />
                                        {regErrors.email && (
                                            <div className="invalid-feedback">{regErrors.email}</div>
                                        )}
                                    </div>
                                    <small className="text-muted" style={{ fontSize: '11px' }}>
                                        Email dùng để đăng nhập và nhận thông tin đơn hàng.
                                    </small>
                                </div>

                                {/* Mật khẩu */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold text-secondary small">
                                        Mật khẩu <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0">
                                            <i className="fa-solid fa-lock"></i>
                                        </span>
                                        <input
                                            type={showRegPassword ? 'text' : 'password'}
                                            className={`form-control border-start-0 border-end-0 ${
                                                regErrors.password ? 'is-invalid' : ''
                                            }`}
                                            placeholder="Tối thiểu 6 ký tự"
                                            value={regPassword}
                                            onChange={(e) => {
                                                setRegPassword(e.target.value);
                                                if (regErrors.password) {
                                                    setRegErrors((prev) => ({ ...prev, password: undefined }));
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="input-group-text bg-light text-muted border-start-0"
                                            onClick={() => setShowRegPassword(!showRegPassword)}
                                            tabIndex={-1}
                                        >
                                            <i className={`fa-regular ${showRegPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                        {regErrors.password && (
                                            <div className="invalid-feedback d-block">{regErrors.password}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Xác nhận mật khẩu */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold text-secondary small">
                                        Xác nhận mật khẩu <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light text-muted border-end-0">
                                            <i className="fa-solid fa-shield-halved"></i>
                                        </span>
                                        <input
                                            type={showRegPassword ? 'text' : 'password'}
                                            className={`form-control border-start-0 ${
                                                regErrors.confirmPassword ? 'is-invalid' : ''
                                            }`}
                                            placeholder="Nhập lại mật khẩu ở trên"
                                            value={regConfirmPassword}
                                            onChange={(e) => {
                                                setRegConfirmPassword(e.target.value);
                                                if (regErrors.confirmPassword) {
                                                    setRegErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                                                }
                                            }}
                                        />
                                        {regErrors.confirmPassword && (
                                            <div className="invalid-feedback">{regErrors.confirmPassword}</div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 py-2 fw-semibold rounded-3 mb-3 shadow-sm"
                                >
                                    <i className="fa-solid fa-user-plus me-2"></i>
                                    Đăng Ký Tài Khoản
                                </button>

                                <div className="text-center pt-2 border-top">
                                    <small className="text-muted">
                                        Đã có tài khoản BikeShop?{' '}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 text-primary fw-semibold small text-decoration-none"
                                            onClick={() => switchMode('login')}
                                        >
                                            Đăng nhập ngay
                                        </button>
                                    </small>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
