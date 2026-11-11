interface NotFoundProps {
    onGoHome: () => void;
    onGoCart?: () => void;
}

export default function NotFound({ onGoHome, onGoCart }: NotFoundProps) {
    return (
        <section className="container py-5 my-5 text-center">
            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-6">
                    <div className="position-relative d-inline-block mb-3">
                        <div
                            className="display-1 fw-bold text-secondary opacity-25"
                            style={{ fontSize: '8rem', lineHeight: '1', letterSpacing: '-4px' }}
                        >
                            404
                        </div>
                        <div className="position-absolute top-50 start-50 translate-middle">
                            <span className="fs-1">🚲</span>
                        </div>
                    </div>

                    <h3 className="fw-bold text-dark mb-3">Không Tìm Thấy Trang</h3>
                    <p className="text-muted fs-6 mb-4 px-md-4">
                        Trang bạn đang tìm kiếm không tồn tại hoặc đường dẫn đã thay đổi.
                    </p>

                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                        <button
                            type="button"
                            className="btn btn-primary px-4 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2"
                            onClick={onGoHome}
                        >
                            <i className="fa-solid fa-house"></i>
                            Quay Về Trang Chủ
                        </button>

                        {onGoCart && (
                            <button
                                type="button"
                                className="btn btn-outline-dark px-4 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2"
                                onClick={onGoCart}
                            >
                                <i className="fa-solid fa-cart-shopping"></i>
                                Xem Giỏ Hàng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
