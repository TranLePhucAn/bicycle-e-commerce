import bikesData from '../../data/bikes.json';
import '../../styles/home.css';

export default function ProductList() {

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
        <section className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark m-0 border-start border-4 border-dark ps-3">
                    DANH SÁCH XE ĐẠP NỔI BẬT
                </h3>
            </div>

            <div className="row g-4">
                {bikesData.map((bike: any) => (
                    <div key={bike.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                        <div className="card product-card h-100 rounded-3 overflow-hidden bg-white shadow-sm position-relative">

                            <span className={`position-absolute top-0 end-0 badge m-2 z-1 ${getStatusBadgeClass(bike.status)}`}>
                {bike.status}
              </span>

                            <div className="product-img-wrapper d-flex align-items-center justify-content-center bg-light" style={{ height: '180px' }}>
                                <span className="text-muted fw-semibold">🚲 {bike.name}</span>
                            </div>

                            <div className="card-body d-flex flex-column">
                                <small className="text-muted mb-1">{bike.category}</small>
                                <h5 className="card-title fs-6 fw-bold text-dark text-truncate mb-2">
                                    {bike.name}
                                </h5>

                                <div className="mt-auto">
                                    <div className="text-danger fw-bold fs-5 mb-2">
                                        {bike.price.toLocaleString('vi-VN')} đ
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <small className="text-muted">Mã: {bike.id}</small>
                                        <small className="text-muted">Kho: {bike.stock}</small>
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
                ))}
            </div>
        </section>
    );
}