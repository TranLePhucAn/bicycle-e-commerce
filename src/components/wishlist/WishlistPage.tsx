import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

interface WishlistPageProps {
    onContinueShopping: () => void;
    onSelectBike?: (bike: any) => void;
    onMoveToCart: (bike: any) => Promise<boolean> | boolean | void;
}

export default function WishlistPage({onContinueShopping, onSelectBike, onMoveToCart,}: WishlistPageProps) {
    const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
    const { showToast } = useToast();

    const getImageSrc = (imagePath: string | undefined) => {
        if (!imagePath) return '/src/assets/images/bike01.png';
        if (/^(https?:|data:|blob:|\/assets\/|\/src\/)/i.test(imagePath)) return imagePath;
        const fileName = imagePath.split('/').pop();
        return `/src/assets/images/${fileName}`;
    };

    const handleMoveSingleToCart = async (bike: any) => {
        const defaultSize = Array.isArray(bike.frameSize) && bike.frameSize.length > 0 ? bike.frameSize[0] : undefined;
        const defaultColor = Array.isArray(bike.colors) && bike.colors.length > 0
            ? (typeof bike.colors[0] === 'string' ? bike.colors[0] : bike.colors[0]?.name)
            : undefined;

        const variantSuffix = [defaultSize, defaultColor].filter(Boolean).join('-');
        const itemToAdd = {
            ...bike,
            id: variantSuffix ? `${bike.id}-${variantSuffix}` : bike.id,
            originalBikeId: bike.id,
            image: getImageSrc(bike.image),
            selectedSize: defaultSize,
            selectedColor: defaultColor,
        };

        const result = await onMoveToCart(itemToAdd);
        if (result !== false) {
            removeFromWishlist(bike.id);
            showToast(`Đã chuyển "${bike.name}" sang giỏ hàng!`, 'success');
        }
    };

    const handleMoveAllToCart = async () => {
        const inStockItems = wishlistItems.filter((item) => (item.stock ?? 1) > 0);
        if (inStockItems.length === 0) {
            showToast('Không có sản phẩm còn hàng để chuyển sang giỏ.', 'warning');
            return;
        }
        for (const bike of inStockItems) {
            await handleMoveSingleToCart(bike);
        }
    };

    return (
        <section className="container py-5">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bold text-dark m-0">
                        <i className="fa-solid fa-heart me-2 text-danger"></i>
                        Sản Phẩm Yêu Thích
                    </h3>
                    <small className="text-muted">Bạn đang lưu {wishlistItems.length} sản phẩm yêu thích</small>
                </div>

                <div className="d-flex flex-wrap gap-2">
                    {wishlistItems.length > 0 && (
                        <>
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                onClick={handleMoveAllToCart}
                            >
                                <i className="fa-solid fa-cart-plus"></i>
                                <span>Chuyển tất cả sang giỏ</span>
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={clearWishlist}
                            >
                                <i className="fa-solid fa-trash-can me-1"></i>Xóa toàn bộ
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                        onClick={onContinueShopping}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Tiếp tục mua hàng</span>
                    </button>
                </div>
            </div>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3 border">
                    <i className="fa-regular fa-heart fs-1 text-muted mb-3"></i>
                    <h4 className="fw-bold text-secondary">Danh sách yêu thích đang trống!</h4>
                    <p className="text-muted">Hãy nhấn biểu tượng trái tim ở các mẫu xe bạn ưng ý để lưu lại tại đây.</p>
                    <button
                        type="button"
                        className="btn btn-dark px-4 py-2 mt-2 rounded-3"
                        onClick={onContinueShopping}
                    >
                        Khám Phá Xe Đạp Ngay
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    {wishlistItems.map((bike) => {
                        const outOfStock = (bike.stock ?? 1) <= 0;
                        return (
                            <div key={bike.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden position-relative">
                                    <button
                                        type="button"
                                        onClick={() => removeFromWishlist(bike.id)}
                                        className="btn btn-light btn-sm rounded-circle position-absolute top-0 end-0 m-2 shadow-sm text-danger"
                                        title="Bỏ khỏi yêu thích"
                                        style={{ width: '34px', height: '34px', zIndex: 2 }}
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>

                                    <div
                                        className="bg-light p-3 d-flex align-items-center justify-content-center"
                                        style={{ height: '200px', cursor: onSelectBike ? 'pointer' : 'default' }}
                                        onClick={() => onSelectBike?.(bike)}
                                    >
                                        <img
                                            src={getImageSrc(bike.image)}
                                            alt={bike.name}
                                            className="img-fluid object-fit-contain h-100"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80';
                                            }}
                                        />
                                    </div>

                                    <div className="card-body d-flex flex-column p-3">
                                        {bike.brand && (
                                            <small className="text-muted text-uppercase fw-semibold mb-1">
                                                {bike.brand}
                                            </small>
                                        )}
                                        <h6
                                            className="fw-bold text-dark mb-2"
                                            style={{ cursor: onSelectBike ? 'pointer' : 'default' }}
                                            onClick={() => onSelectBike?.(bike)}
                                        >
                                            {bike.name}
                                        </h6>

                                        <div className="mb-3">
                                            <span className="fw-bold text-danger fs-5">
                                                {bike.price?.toLocaleString('vi-VN')} đ
                                            </span>
                                            {bike.originalPrice && (
                                                <small className="text-muted text-decoration-line-through ms-2">
                                                    {bike.originalPrice?.toLocaleString('vi-VN')} đ
                                                </small>
                                            )}
                                        </div>

                                        <div className="mt-auto d-grid gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-dark btn-sm fw-semibold py-2 rounded-3"
                                                disabled={outOfStock}
                                                onClick={() => handleMoveSingleToCart(bike)}
                                            >
                                                <i className="fa-solid fa-cart-plus me-2"></i>
                                                {outOfStock ? 'Tạm hết hàng' : 'Chuyển sang giỏ'}
                                            </button>
                                            {onSelectBike && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm rounded-3"
                                                    onClick={() => onSelectBike(bike)}
                                                >
                                                    Xem chi tiết
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}