
export default function Footer() {
    return (
        <footer className="bg-dark text-white pt-5 pb-4 mt-auto">
            <div className="container text-center text-md-start">
                <div className="row text-center text-md-start">
                    <div className="col-md-3 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold text-warning">BikeShop</h5>
                        <p>Chuyên cung cấp các dòng xe đạp thể thao, địa hình và phụ kiện chính hãng chất lượng cao.</p>
                    </div>

                    <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold text-warning">Danh Mục</h5>
                        <p><a href="#" className="text-white text-decoration-none">Xe Đạp Thể Thao</a></p>
                        <p><a href="#" className="text-white text-decoration-none">Xe Đạp Địa Hình</a></p>
                        <p><a href="#" className="text-white text-decoration-none">Phụ Kiện</a></p>
                    </div>

                    <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mt-3">
                        <h5 className="text-uppercase mb-4 fw-bold text-warning">Liên Hệ</h5>
                        <p><i className="fa fa-map-marker"></i> Trường Đại học Nông Lâm TP.HCM</p>
                        <p><i className="fa fa-envelope"></i> support@bikeshop.com</p>
                        <p><i className="fa fa-phone"></i> 0123 456 789</p>
                    </div>
                </div>

                <hr className="mb-4" />

                <div className="row justify-content-center">
                    <div className="col-md-10 text-center">
                        <p className="mb-0">
                            © 2026 Copyright: <strong className="text-warning">BikeShop E-Commerce</strong>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}