import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function BikeDetail({bike, onSelectTab, onAddToCart}: {
    bike: any;
    onSelectTab?: (category: string) => void;
    onAddToCart?: (bike: any, quantity: number) => void;
}) {
    const { showToast } = useToast();
    const [quantity, setQuantity] = useState<number>(1);
    const maxStock = bike?.stock ?? 0;

    if (!bike) return null;

    const handleIncrease = () => {
        if (quantity < maxStock) setQuantity((prev) => prev + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

    const handleAddToCart = () => {
        onAddToCart?.(bike, quantity);
        showToast(`Đã thêm ${quantity} x "${bike.name}" vào giỏ hàng!`, 'success');
    };

    const categoryText = Array.isArray(bike.category) ? bike.category.join(', ') : (bike.category || 'Xe đạp');

    return (
        <section className="container py-3">
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                        <a
                            href="#"
                            className="text-decoration-none text-muted"
                            onClick={(e) => {
                                e.preventDefault();
                                onSelectTab?.('Tất cả');
                            }}
                        >
                            Trang chủ
                        </a>
                    </li>
                    <li className="breadcrumb-item">
                        <a
                            href="#"
                            className="text-decoration-none text-muted"
                            onClick={(e) => {
                                e.preventDefault();
                                onSelectTab?.(categoryText);
                            }}
                        >
                            {categoryText}
                        </a>
                    </li>
                    <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
                        {bike.name}
                    </li>
                </ol>
            </nav>

            <div className="border-0 p-4 mb-4">
                <div className="row g-4 align-items-center">
                    <div className="col-12 col-md-5 text-center">
                        <div className="p-4 bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ minHeight: '320px' }}>
                            <img
                                src={`/src/assets/images/${bike.image}`}
                                alt={bike.name}
                                className="img-fluid object-fit-contain"
                                style={{ maxHeight: '280px' }}
                            />
                        </div>
                    </div>

                    <div className="col-12 col-md-7">
                        <h3 className="fw-bold text-dark mb-3">{bike.name}</h3>

                        <div className="d-flex align-items-baseline gap-3 mb-3">
                            <span className="fs-2 fw-bold">
                                {bike.price?.toLocaleString('vi-VN')} đ
                            </span>
                            {bike.originalPrice && (
                                <span className="text-muted text-decoration-line-through fs-6">
                                    {bike.originalPrice?.toLocaleString('vi-VN')} đ
                                </span>
                            )}
                            {bike.discount && (
                                <span className="badge bg-danger fs-6">
                                    {bike.discount}
                                </span>
                            )}
                        </div>

                        <div className="mb-3">
                            <span className="text-muted me-2">Tình trạng:</span>
                            {maxStock > 0 ? (
                                <span className="text-success py-1">
                                    Còn {maxStock} sản phẩm
                                </span>
                            ) : (
                                <span className="text-danger py-1">
                                    Hết hàng
                                </span>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="form-label fw-semibold text-dark d-block">
                                Số lượng mua:
                            </label>
                            <div className="d-flex align-items-center gap-3">
                                <div className="input-group" style={{ width: '140px' }}>
                                    <button
                                        className="btn btn-outline-secondary px-3"
                                        type="button"
                                        onClick={handleDecrease}
                                        disabled={quantity <= 1 || maxStock === 0}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        className="form-control text-center shadow-none"
                                        value={quantity}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-outline-secondary px-3"
                                        type="button"
                                        onClick={handleIncrease}
                                        disabled={quantity >= maxStock || maxStock === 0}
                                    >
                                        +
                                    </button>
                                </div>
                                {quantity >= maxStock && maxStock > 0 && (
                                    <small className="text-warning fw-semibold">
                                        (Đã đạt giới hạn tồn kho)
                                    </small>
                                )}
                            </div>
                        </div>

                        <div className="d-flex gap-3">
                            <button
                                type="button"
                                className="btn btn-dark px-4 rounded-3 fw-bold"
                                onClick={handleAddToCart}
                                disabled={maxStock === 0}
                            >
                                <i className="fa-solid fa-cart-plus me-2"></i>
                                {maxStock > 0 ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-5 pt-4 border-top">
                    <h5 className="fw-bold text-dark text-uppercase mb-3">Thông số kỹ thuật</h5>
                    <div className="row g-3">
                        <div className="col-12 col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                                <span className="text-muted d-block small">Khung xe:</span>
                                <strong className="text-dark">{bike.specs?.frame || 'Hợp kim nhôm siêu nhẹ'}</strong>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                                <span className="text-muted d-block small">Bộ phanh:</span>
                                <strong className="text-dark">{bike.specs?.brake || 'Phanh đĩa cơ an toàn'}</strong>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                                <span className="text-muted d-block small">Kích thước bánh:</span>
                                <strong className="text-dark">{bike.specs?.wheelSize || '26 / 27.5 inch'}</strong>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                                <span className="text-muted d-block small">Bộ truyền động:</span>
                                <strong className="text-dark">{bike.specs?.speed || 'Shimano 21 tốc độ'}</strong>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="p-3 bg-light rounded-3 border">
                                <span className="text-muted d-block small">Trọng lượng:</span>
                                <strong className="text-dark">{bike.specs?.weight || '14.5 kg'}</strong>
                            </div>
                        </div>
                    </div>

                    {bike.description && (
                        <div className="mt-4">
                            <h6 className="fw-bold text-dark mb-2">Mô tả chi tiết:</h6>
                            <p className="text-secondary small mb-0">{bike.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
