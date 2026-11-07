export default function BikeCard({ bike }: { bike: any }) {
    const getStatusBadgeClass = (status: any) => {
        switch (status) {
            case 'Còn hàng':
                return 'bg-success';
            case 'Sắp hết':
                return 'bg-warning text-dark';
            case 'Hết hàng':
                return 'bg-secondary';
            default:
                return 'bg-dark';
        }
    };

    return (
        <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card product-card h-100 rounded-3 overflow-hidden bg-white shadow-sm position-relative">
                {bike.discount && (
                    <span className="position-absolute top-0 start-0 badge bg-danger m-2 z-1">
                        {bike.discount}
                    </span>
                )}

                <span className={`position-absolute top-0 end-0 badge m-2 z-1 ${getStatusBadgeClass(bike.status)}`}>
                    {bike.status}
                </span>

                <div className="product-img-wrapper d-flex align-items-center justify-content-center bg-light p-2" style={{ height: '180px' }}>
                    <img src={`/src/assets/images/${bike.image}`} alt={bike.name} className="w-100 h-100 object-fit-contain" />
                </div>

                <div className="card-body d-flex flex-column">
                    <small className="text-muted mb-1">{bike.category}</small>
                    <h5 className="card-title fs-6 fw-bold text-dark text-truncate mb-2" title={bike.name}>
                        {bike.name}
                    </h5>

                    <div className="mt-auto">
                        <div className="d-flex align-items-end gap-2 mb-2">
                            <div className="text-danger fw-bold fs-5 lh-1">
                                {bike.price.toLocaleString('vi-VN')} đ
                            </div>
                            {bike.originalPrice && (
                                <div className="text-muted text-decoration-line-through lh-1" style={{ fontSize: '13px' }}>
                                    {bike.originalPrice.toLocaleString('vi-VN')} đ
                                </div>
                            )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                            <span>Mã: {bike.id}</span>
                            <span>Kho: {bike.stock}</span>
                        </div>

                        <button
                            className={`btn w-100 btn-sm py-2 fw-semibold ${bike.stock === 0 ? 'btn-secondary disabled' : 'btn-dark'}`}
                        >
                            <i className="fa-solid fa-cart-plus me-2"></i>
                            {bike.stock === 0 ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}