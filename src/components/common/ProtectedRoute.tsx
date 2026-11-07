import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    onRedirectHome: () => void;
    routeName?: string;
}

export default function ProtectedRoute({
    children,
    onRedirectHome,
    routeName = 'trang này',
}: ProtectedRouteProps) {
    const { isLoggedIn, openLoginModal } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!isLoggedIn) {
            showToast(`Vui lòng đăng nhập để truy cập ${routeName}!`, 'warning');
        }
    }, [isLoggedIn, routeName, showToast]);

    if (isLoggedIn) {
        return <>{children}</>;
    }

    return (
        <section className="container py-5 my-4">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="card shadow-sm border-0 rounded-4 text-center p-4 p-md-5 bg-white">
                        <div
                            className="rounded-circle bg-warning bg-opacity-10 d-inline-flex align-items-center justify-content-center mx-auto mb-4"
                            style={{ width: '80px', height: '80px' }}
                        >
                            <i className="fa-solid fa-lock text-warning fs-1"></i>
                        </div>

                        <h4 className="fw-bold text-dark mb-2">Yêu Cầu Đăng Nhập</h4>
                        <p className="text-muted mb-4">
                            Vui lòng đăng nhập tài khoản để xem được nội dung {routeName}.
                        </p>

                        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                            <button
                                type="button"
                                className="btn btn-primary px-4 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
                                onClick={() => openLoginModal('login')}
                            >
                                <i className="fa-solid fa-right-to-bracket"></i>
                                Đăng Nhập Ngay
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4 py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
                                onClick={onRedirectHome}
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                                Về Trang Chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
