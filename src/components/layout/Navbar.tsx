interface NavbarProps {
    currentTab?: string;
    onSelectTab?: (tab: string) => void;
    cartCount?: number;
}

export default function Navbar({ currentTab = 'home', onSelectTab, cartCount = 2 }: NavbarProps) {
    const handleTabClick = (e: React.MouseEvent, tab: string) => {
        e.preventDefault();
        if (onSelectTab) {
            onSelectTab(tab);
        }
    };

    return (
        <>
            <header className="shadow-sm bg-white">
                <div className="container py-3">
                    <div className="row align-items-center gy-3">
                        {/* Logo */}
                        <div className="col-12 col-md-3 text-center text-md-start">
                            <a
                                href="#"
                                onClick={(e) => handleTabClick(e, 'home')}
                                className="text-decoration-none d-inline-block"
                                title="Về Trang chủ"
                            >
                                <div className="d-flex align-items-center">
                                    <span
                                        className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-2"
                                        style={{ width: '45px', height: '45px', backgroundColor: '#1e293b' }}
                                    >
                                        🚲
                                    </span>
                                    <div className="lh-1 text-start">
                                        <div className="fw-bold fs-4 tracking-wider" style={{ color: '#1e293b' }}>BIKESHOP</div>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>PHÂN PHỐI XE ĐẠP</small>
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* Search input */}
                        <div className="col-12 col-md-5">
                            <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                                <div className="input-group rounded-3 overflow-hidden" style={{ border: '1px solid #1e293b' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0 shadow-none px-3"
                                        placeholder="Tìm kiếm dòng xe, thương hiệu..."
                                        aria-label="Search"
                                    />
                                    <button className="btn text-white px-4" type="submit" style={{ backgroundColor: '#1e293b' }}>
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Cart & History Buttons */}
                        <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-end align-items-center gap-3">
                            {/* Nút Giỏ hàng */}
                            <button
                                type="button"
                                onClick={(e) => handleTabClick(e, 'cart')}
                                className={`btn rounded-3 d-flex align-items-center gap-2 px-3 py-2 text-decoration-none ${
                                    currentTab === 'cart' ? 'btn-primary text-white' : 'btn-outline-dark'
                                }`}
                                style={
                                    currentTab === 'cart'
                                        ? { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }
                                        : { border: '1px solid #1e293b', color: '#1e293b' }
                                }
                            >
                                <i className="fa-solid fa-bag-shopping"></i>
                                <span className={`fw-semibold ${currentTab === 'cart' ? 'text-white' : 'text-dark'}`}>
                                    Giỏ hàng
                                </span>
                                <span
                                    className="badge fw-bold px-2 py-1 text-white rounded-pill"
                                    style={{ backgroundColor: currentTab === 'cart' ? '#1e293b' : '#ef4444' }}
                                >
                                    {cartCount}
                                </span>
                            </button>

                            {/* Nút Lịch sử đơn hàng */}
                            <a
                                href="#"
                                onClick={(e) => handleTabClick(e, 'history')}
                                className={`d-flex align-items-center text-decoration-none gap-2 px-2 py-1 rounded-2 ${
                                    currentTab === 'history' ? 'bg-light border' : ''
                                }`}
                                title="Xem lịch sử đơn hàng"
                            >
                                <i className={`fa-solid fa-clock-rotate-left fs-4 ${currentTab === 'history' ? 'text-primary' : 'text-secondary'}`}></i>
                                <div className="lh-sm text-start" style={{ fontSize: '13px' }}>
                                    <div className={`fw-semibold ${currentTab === 'history' ? 'text-primary' : 'text-dark'}`}>
                                        Lịch sử đơn
                                    </div>
                                    <div className="text-muted small">Tra cứu đơn hàng</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Menu chính dạng Tab Navigation */}
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
                            <li className="nav-item" style={currentTab === 'home' ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className={`nav-link px-3 py-3 text-white ${currentTab === 'home' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => handleTabClick(e, 'home')}
                                >
                                    <i className="fa-solid fa-house me-1"></i> TRANG CHỦ
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    className="nav-link px-3 py-3 text-white"
                                    href="#"
                                    onClick={(e) => handleTabClick(e, 'home')}
                                >
                                    XE ĐẠP ›
                                </a>
                            </li>
                            <li className="nav-item" style={currentTab === 'cart' ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className={`nav-link px-3 py-3 text-white ${currentTab === 'cart' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => handleTabClick(e, 'cart')}
                                >
                                    <i className="fa-solid fa-cart-shopping me-1"></i> GIỎ HÀNG
                                </a>
                            </li>
                            <li className="nav-item" style={currentTab === 'history' ? { backgroundColor: '#3b82f6' } : {}}>
                                <a
                                    className={`nav-link px-3 py-3 text-white ${currentTab === 'history' ? 'active' : ''}`}
                                    href="#"
                                    onClick={(e) => handleTabClick(e, 'history')}
                                >
                                    <i className="fa-solid fa-clock-rotate-left me-1"></i> LỊCH SỬ ĐƠN HÀNG
                                </a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link px-3 py-3 text-white" href="#about">
                                    GIỚI THIỆU ›
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}
