import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
    currentTab?: string;
    selectedCategory?: string | string[];
    onSelectTab?: (tab: string | string[]) => void;
    onSearch?: (keyword: string) => void;
    onOpenCartDrawer?: () => void;
}

export default function Navbar({
                                   currentTab = 'home',
                                   selectedCategory = 'Tất cả',
                                   onSelectTab,
                                   onSearch,
                                   onOpenCartDrawer,
                               }: NavbarProps) {
    const { user, isLoggedIn, logout, openLoginModal } = useAuth();
    const { showToast } = useToast();
    const { totalCount } = useCart();
    const [searchTerm, setSearchTerm] = useState('');

    const handleTabClick = (e: React.MouseEvent, tab: string) => {
        e.preventDefault();
        if (onSelectTab) {
            onSelectTab(tab);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            showToast('Đã đăng xuất thành công.', 'info');
            if (currentTab === 'history' && onSelectTab) {
                onSelectTab('home');
            }
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể đăng xuất.', 'danger');
        }
    };

    const isCategoryActive = (categoryName: string) => {
        if (currentTab !== 'home') return false;
        if (Array.isArray(selectedCategory)) {
            return selectedCategory.includes(categoryName);
        }
        return selectedCategory === categoryName;
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const text = searchTerm.trim();
        if (!text) {
            showToast('Vui lòng nhập từ khóa tìm kiếm!', 'warning');
            return;
        }
        onSearch?.(text);
    };

    return (
        <>
            <header className="shadow-sm bg-white border-bottom">
                <div className="container py-3">
                    <div className="row align-items-center gy-3">
                        <div className="col-12 col-md-3 text-center text-md-start">
                            <a
                                href="#"
                                onClick={(e) => handleTabClick(e, 'home')}
                                className="text-decoration-none d-inline-block"
                            >
                                <div className="d-flex align-items-center">
                                    <span
                                        className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-2"
                                        style={{ width: '45px', height: '45px', backgroundColor: '#1e293b' }}
                                    >
                                        🚲
                                    </span>
                                    <div className="lh-1 text-start">
                                        <div className="fw-bold fs-4 tracking-wider" style={{ color: '#1e293b' }}>
                                            BIKESHOP
                                        </div>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>
                                            PHÂN PHỐI XE ĐẠP CHÍNH HÃNG
                                        </small>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-md-3">
                            <form className="d-flex" onSubmit={handleSearchSubmit}>
                                <div className="input-group rounded-3 overflow-hidden" style={{ border: '1px solid #1e293b' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0 shadow-none px-3"
                                        placeholder="Tìm kiếm dòng xe, thương hiệu..."
                                        aria-label="Search"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <button className="btn text-white px-3" type="submit" style={{ backgroundColor: '#1e293b' }}>
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="col-12 col-md-6 d-flex justify-content-center justify-content-md-end align-items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={(e) => handleTabClick(e, 'history')}
                                className={`btn rounded-3 d-flex align-items-center gap-2 px-3 py-2 text-nowrap ${
                                    currentTab === 'history' ? 'btn-primary text-white' : 'btn-outline-secondary'
                                }`}
                                title="Xem lịch sử đơn hàng"
                            >
                                <i className="fa-solid fa-clock-rotate-left"></i>
                                <span className="fw-semibold small">Lịch sử đơn</span>
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (onOpenCartDrawer) onOpenCartDrawer();
                                    else handleTabClick(e, 'cart');
                                }}
                                className={`btn rounded-3 d-flex align-items-center gap-2 px-3 py-2 text-nowrap ${
                                    currentTab === 'cart' ? 'btn-primary text-white' : 'btn-outline-secondary'
                                }`}
                                title="Mở giỏ hàng"
                            >
                                <i className="fa-solid fa-bag-shopping"></i>
                                <span className="fw-semibold small">Giỏ hàng</span>
                                <span
                                    className="badge fw-bold px-2 py-1 rounded-pill bg-danger text-white"
                                >
                                    {totalCount}
                                </span>
                            </button>

                            {isLoggedIn ? (
                                <div className="dropdown">
                                    <button
                                        type="button"
                                        className="btn btn-light rounded-3 d-flex align-items-center gap-2 p-1 pe-3 border dropdown-toggle shadow-none"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <span
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                                            style={{ width: '32px', height: '32px', fontSize: '13px' }}
                                        >
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                        <div className="d-none d-xl-flex flex-column text-start" style={{ lineHeight: 1.1 }}>
                                            <span className="fw-semibold text-dark small">
                                                {user?.name}
                                            </span>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>
                                                {user?.role || 'Thành viên'}
                                            </span>
                                        </div>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 py-2">
                                        <li>
                                            <a
                                                className={`dropdown-item py-2 d-flex align-items-center gap-2 ${currentTab === 'account' ? 'active bg-primary text-white' : ''}`}
                                                href="#"
                                                onClick={(e) => handleTabClick(e, 'account')}
                                            >
                                                <i className="fa-solid fa-user text-primary"></i>
                                                <span>Hồ sơ & Sổ địa chỉ</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className={`dropdown-item py-2 d-flex align-items-center gap-2 ${currentTab === 'history' ? 'active bg-primary text-white' : ''}`}
                                                href="#"
                                                onClick={(e) => handleTabClick(e, 'history')}
                                            >
                                                <i className="fa-solid fa-clock-rotate-left text-secondary"></i>
                                                <span>Lịch sử đơn hàng</span>
                                            </a>
                                        </li>
                                        <li><hr className="dropdown-divider my-1" /></li>
                                        <li>
                                            <button
                                                type="button"
                                                className="dropdown-item py-2 text-danger d-flex align-items-center gap-2"
                                                onClick={handleLogout}
                                            >
                                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                                <span>Đăng xuất</span>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark rounded-3 d-flex align-items-center gap-2 px-3 py-2 text-nowrap"
                                        onClick={() => openLoginModal('login')}
                                        title="Đăng nhập tài khoản"
                                    >
                                        <i className="fa-regular fa-user"></i>
                                        <span className="fw-semibold small">Đăng nhập</span>
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-dark rounded-3 d-flex align-items-center gap-2 px-3 py-2 text-nowrap"
                                        onClick={() => openLoginModal('register')}
                                        title="Đăng ký tài khoản mới"
                                    >
                                        <i className="fa-solid fa-user-plus"></i>
                                        <span className="fw-semibold small">Đăng ký</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <nav className="navbar navbar-expand-lg sticky-top navbar-dark p-0 m-0 border-0" style={{ backgroundColor: '#1e293b' }}>
                <div className="container">
                    <button
                        className="navbar-toggler my-2 ms-auto"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#mainMenu"
                        aria-controls="mainMenu"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="mainMenu">
                        <ul className="navbar-nav w-100 justify-content-center text-uppercase fw-bold" style={{ fontSize: '14px' }}>
                            <li className="nav-item" style={(currentTab === 'home' && selectedCategory === 'Tất cả') ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className={`nav-link px-3 py-3 text-white ${(currentTab === 'home' && selectedCategory === 'Tất cả') ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => handleTabClick(e, 'home')}
                                >
                                    <i className="fa-solid fa-house me-1"></i> TRANG CHỦ
                                </a>
                            </li>
                            <li className="nav-item" style={isCategoryActive('Xe địa hình (MTB)') ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className="nav-link px-3 py-3 text-white"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onSelectTab) onSelectTab('Xe địa hình (MTB)');
                                    }}
                                >
                                    XE ĐỊA HÌNH (MTB)
                                </a>
                            </li>
                            <li className="nav-item" style={isCategoryActive('Xe đạp đua') ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className="nav-link px-3 py-3 text-white"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onSelectTab) onSelectTab('Xe đạp đua');
                                    }}
                                >
                                    XE ĐẠP ĐUA (ROAD)
                                </a>
                            </li>
                            <li className="nav-item" style={isCategoryActive('Xe đường phố (Touring)') ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className="nav-link px-3 py-3 text-white"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onSelectTab) onSelectTab('Xe đường phố (Touring)');
                                    }}
                                >
                                    XE ĐƯỜNG PHỐ (TOURING)
                                </a>
                            </li>
                            <li className="nav-item" style={(currentTab === 'home' && Array.isArray(selectedCategory) && selectedCategory.includes('Xe đạp điện')) ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className="nav-link px-3 py-3 text-white"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (onSelectTab) onSelectTab(['Xe đạp điện', 'Xe đạp gấp']);
                                    }}
                                >
                                    XE ĐIỆN & GẤP
                                </a>
                            </li>
                            <li className="nav-item" style={currentTab === 'about' ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className={`nav-link px-3 py-3 text-white ${currentTab === 'about' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => handleTabClick(e, 'about')}
                                >
                                    VỀ CHÚNG TÔI
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link px-3 py-3 text-white"
                                    href="#"
                                    onClick={(e) => handleTabClick(e, 'not-found')}
                                    title="Kiểm tra trang 404"
                                >
                                    BẢO HÀNH (404)
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}