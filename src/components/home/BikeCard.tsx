import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function BikeCard({ bike, onDetailClick }: { bike: any; onDetailClick?: (bike: any) => void }) {
    const { addToCart } = useCart();
    const { showToast } = useToast();

    const handleAddToCart = async () => {
        const added = await addToCart(bike);
        if (added) showToast(`Đã thêm "${bike.name}" vào giỏ hàng!`, 'success');
    };

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

    const getImageSrc = (imagePath: string | undefined) => {
        if (!imagePath) return '/src/assets/images/bike01.png';
        if (/^(https?:|data:|blob:|\/assets\/|\/src\/)/i.test(imagePath)) return imagePath;
        const fileName = imagePath.split('/').pop();
        return `/src/assets/images/${fileName}`;
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

                <div
                    className="product-img-wrapper d-flex align-items-center justify-content-center bg-light p-2"
                    style={{ height: '180px', cursor: 'pointer' }}
                    onClick={() => onDetailClick?.(bike)}
                >
                    <img
                        src={getImageSrc(bike.image)}
                        alt={bike.name}
                        className="w-100 h-100 object-fit-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80';
                        }}
                    />
                </div>

                <div className="card-body d-flex flex-column">
                    <small className="text-muted mb-1">{bike.category}</small>

                    <h5
                        className="card-title fs-6 fw-bold text-dark text-truncate mb-2"
                        title={bike.name}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onDetailClick?.(bike)}
                    >
                        {bike.name}
                    </h5>

                    <div className="mt-auto">
                        <div className="d-flex align-items-end gap-2 mb-2">
                            <div className="text-danger fw-bold fs-5 lh-1">
                                {bike.price?.toLocaleString('vi-VN')} đ
                            </div>
                            {bike.originalPrice && (
                                <div className="text-muted text-decoration-line-through lh-1" style={{ fontSize: '13px' }}>
                                    {bike.originalPrice?.toLocaleString('vi-VN')} đ
                                </div>
                            )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                            <span>Mã: {bike.id}</span>
                            <span>Kho: {bike.stock}</span>
                        </div>

                        <button
                            type="button"
                            className={`btn w-100 btn-sm py-2 fw-semibold ${bike.stock === 0 ? 'btn-secondary disabled' : 'btn-dark'}`}
                            onClick={handleAddToCart}
                            disabled={bike.stock === 0}
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
