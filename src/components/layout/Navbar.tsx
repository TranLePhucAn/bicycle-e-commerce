
export default function Navbar() {
    return (
        <>
            <header className="shadow-sm bg-white">

                <div className="container py-3">
                    <div className="row align-items-center gy-3">

                        <div className="col-12 col-md-3 text-center text-md-start">
                            <a href="#" className="text-decoration-none d-inline-block">
                                <div className="d-flex align-items-center">
                                <span className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-2"
                                      style={{ width: '45px', height: '45px', backgroundColor: '#1e293b' }}>
                                  A
                                </span>
                                    <div className="lh-1 text-start">
                                        <div className="fw-bold fs-4 tracking-wider" style={{ color: '#1e293b' }}>BIKESHOP</div>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>PHÂN PHỐI XE ĐẠP</small>
                                    </div>
                                </div>
                            </a>
                        </div>

                        <div className="col-12 col-md-5">
                            <form className="d-flex">
                                <div className="input-group rounded-3 overflow-hidden" style={{ border: '1px solid #1e293b' }}>
                                    <input
                                        type="text"
                                        className="form-control border-0 shadow-none px-3"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        aria-label="Search"
                                    />
                                    <button className="btn text-white px-4" type="submit" style={{ backgroundColor: '#1e293b' }}>
                                        <i className="fa-solid fa-magnifying-glass"></i>
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-end align-items-center gap-3">
                            <a href="#" className="btn rounded-3 d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
                               style={{ border: '1px solid #1e293b', color: '#1e293b' }}>
                                <i className="fa-solid fa-bag-shopping"></i>
                                <span className="fw-semibold text-dark">Giỏ hàng</span>
                                <span className="badge fw-bold px-2 py-1 text-white" style={{ backgroundColor: '#1e293b' }}>0</span>
                            </a>

                            <a href="#" className="d-flex align-items-center text-decoration-none text-dark gap-2 ms-2">
                                <i className="fa-regular fa-user fs-3 text-secondary"></i>
                                <div className="lh-sm text-start" style={{ fontSize: '13px' }}>
                                    <div className="fw-semibold">Đăng nhập</div>
                                    <div className="text-muted small">Tài khoản và đơn hàng</div>
                                </div>
                            </a>
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
                            <li className="nav-item">
                                <a className="nav-link px-3 py-3 text-white" href="#">THƯƠNG HIỆU ›</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link px-3 py-3 text-white" href="#">XE ĐẠP ›</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link px-3 py-3 text-white" href="#">XE ĐIỆN ›</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link px-3 py-3 text-white" href="#">PHỤ TÙNG ›</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link px-3 py-3 text-white" href="#">PHỤ KIỆN ›</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link px-3 py-3 text-white" href="#">DỊCH VỤ ›</a>
                            </li>

                            <li className="nav-item" style={{ backgroundColor: '#16386b' }}>
                                <a className="nav-link px-3 py-3 text-white active" href="#">GIỚI THIỆU ›</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}