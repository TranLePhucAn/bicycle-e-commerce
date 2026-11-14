import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import '../../styles/bikedetail.css';

interface ReviewItem {
    id: string;
    userName: string;
    avatar?: string;
    rating: number;
    comment: string;
    date: string;
}

export default function BikeDetail({ bike, onSelectTab, onAddToCart }: {
    bike: any;
    onSelectTab?: (category: string) => void;
    onAddToCart?: (bike: any, quantity: number) => Promise<boolean> | boolean;
}) {
    const { showToast } = useToast();
    const { user, openLoginModal } = useAuth() as any;

    const [quantity, setQuantity] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<'description' | 'warranty' | 'reviews'>('description');

    const [reviews, setReviews] = useState<ReviewItem[]>([
        {
            id: 'rev-1',
            userName: 'Minh Tuấn',
            rating: 5,
            comment: 'Xe chạy rất đầm, chuyển số mượt mà, đóng gói giao hàng cẩn thận.',
            date: '10/11/2026',
        },
        {
            id: 'rev-2',
            userName: 'Hoàng Nam',
            rating: 5,
            comment: 'Khung nhôm nhẹ, nước sơn đẹp đúng như mô tả.',
            date: '05/11/2026',
        },
    ]);
    const [ratingInput, setRatingInput] = useState<number>(5);
    const [commentInput, setCommentInput] = useState<string>('');

    const galleryImages: string[] =
        Array.isArray(bike?.images) && bike.images.length > 0
            ? bike.images
            : bike?.image
                ? [bike.image]
                : [];

    const availableSizes: string[] =
        Array.isArray(bike?.frameSize) && bike.frameSize.length > 0
            ? bike.frameSize
            : ['S', 'M', 'L'];

    const availableColors: string[] =
        Array.isArray(bike?.colors) && bike.colors.length > 0
            ? bike.colors.map((c: any) => (typeof c === 'string' ? c : c.name)).filter(Boolean)
            : [];

    const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
    const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || '');
    const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || '');

    useEffect(() => {
        setQuantity(1);
        setActiveImageIndex(0);
        setActiveTab('description');
        setSelectedSize(availableSizes[0] || '');
        setSelectedColor(availableColors[0] || '');
    }, [bike?.id]);

    const maxStock = bike?.stock ?? 0;

    if (!bike) return null;

    const currentImage = galleryImages[activeImageIndex] || bike.image;

    const handleIncrease = () => {
        if (quantity < maxStock) setQuantity((prev) => prev + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) setQuantity((prev) => prev - 1);
    };

<<<<<<< HEAD
    const getImageSrc = (imagePath: string | undefined) => {
        if (!imagePath) return '/src/assets/images/bike01.png';
        if (/^(https?:|data:|blob:|\/assets\/|\/src\/)/i.test(imagePath)) return imagePath;
        const fileName = imagePath.split('/').pop();
        return `/src/assets/images/${fileName}`;
    };

    const handleAddToCart = async () => {
=======
    const handleAddToCart = () => {
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
        const variantSuffix = [selectedSize, selectedColor].filter(Boolean).join('-');
        const itemToAdd = {
            ...bike,
            id: variantSuffix ? `${bike.id}-${variantSuffix}` : bike.id,
            originalBikeId: bike.id,
<<<<<<< HEAD
            image: getImageSrc(currentImage),
=======
            image: `/src/assets/images/${currentImage}`,
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
            selectedSize: selectedSize || undefined,
            selectedColor: selectedColor || undefined,
        };

<<<<<<< HEAD
        const added = await onAddToCart?.(itemToAdd, quantity);

        if (added !== false) {
            const optionText = [
                selectedSize ? `Size ${selectedSize}` : '',
                selectedColor || '',
            ].filter(Boolean).join(' - ');

            showToast(
                `Đã thêm ${quantity} x "${bike.name}"${optionText ? ` (${optionText})` : ''} vào giỏ hàng!`,
                'success'
            );
        }
=======
        onAddToCart?.(itemToAdd, quantity);

        const optionText = [
            selectedSize ? `Size ${selectedSize}` : '',
            selectedColor || '',
        ].filter(Boolean).join(' - ');

        showToast(
            `Đã thêm ${quantity} x "${bike.name}"${optionText ? ` (${optionText})` : ''} vào giỏ hàng!`,
            'success'
        );
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentInput.trim()) {
            showToast('Vui lòng nhập nội dung đánh giá!', 'warning');
            return;
        }

        const newReview: ReviewItem = {
            id: `rev-${Date.now()}`,
            userName: user?.name || user?.fullName || user?.username || user?.email || 'Khách hàng',
            avatar: user?.avatar,
            rating: ratingInput,
            comment: commentInput.trim(),
            date: new Date().toLocaleDateString('vi-VN'),
        };

        setReviews((prev) => [newReview, ...prev]);
        setCommentInput('');
        setRatingInput(5);
        showToast('Cảm ơn bạn đã gửi đánh giá sản phẩm!', 'success');
    };

    const categoryText = Array.isArray(bike.category) ? bike.category.join(', ') : (bike.category || 'Xe đạp');

    const specGroups: Record<string, Record<string, string>> = (() => {
        if (bike.specs && typeof bike.specs === 'object') {
            const values = Object.values(bike.specs);
            if (values.length > 0 && typeof values[0] === 'object' && values[0] !== null) {
                return bike.specs;
            }
        }
        return {};
    })();

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

            <div className="border-0 p-2 p-md-4 mb-4">
                <div className="row g-4 align-items-start">
                    <div className="col-12 col-md-5 text-center">
                        <div className="p-4 bg-light rounded-4 d-flex align-items-center justify-content-center mb-3" style={{ minHeight: '320px' }}>
                            <img
<<<<<<< HEAD
                                src={getImageSrc(currentImage)}
=======
                                src={`/src/assets/images/${currentImage}`}
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
                                alt={bike.name}
                                className="img-fluid object-fit-contain"
                                style={{ maxHeight: '280px' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80';
                                }}
                            />
                        </div>

                        {galleryImages.length > 1 && (
                            <div className="d-flex justify-content-center gap-2 flex-wrap">
                                {galleryImages.map((imgName, idx) => (
                                    <button
                                        key={`${imgName}-${idx}`}
                                        type="button"
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`btn p-1 bg-light rounded-3 border ${
                                            activeImageIndex === idx ? 'border-dark border-2 shadow-sm' : 'border-secondary-subtle opacity-75'
                                        }`}
                                        style={{ width: '64px', height: '64px' }}
                                    >
                                        <img
<<<<<<< HEAD
                                            src={getImageSrc(imgName)}
=======
                                            src={`/src/assets/images/${imgName}`}
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
                                            alt={`${bike.name} ${idx + 1}`}
                                            className="img-fluid h-100 w-100 object-fit-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="col-12 col-md-7">
                        <h3 className="fw-bold text-dark mb-3">{bike.name}</h3>

                        <div className="d-flex flex-column align-items-start gap-1 mb-3">
                            <div className="d-flex align-items-center gap-2">
                                <span className="fs-2 fw-bold text-nowrap">
                                    {bike.price?.toLocaleString('vi-VN')} đ
                                </span>
                                {bike.discount && (
                                    <span className="badge bg-danger fs-6">
                                        {bike.discount}
                                    </span>
                                )}
                            </div>
                            {bike.originalPrice && (
                                <span className="text-muted text-decoration-line-through fs-6 text-nowrap">
                                    {bike.originalPrice?.toLocaleString('vi-VN')} đ
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

                        {availableColors.length > 0 && (
                            <div className="mb-3">
                                <label className="form-label fw-semibold text-dark d-block mb-2">
                                    Màu sắc:
                                </label>
                                <div className="d-flex flex-wrap gap-2">
                                    {availableColors.map((colorName) => {
                                        const isSelected = selectedColor === colorName;
                                        return (
                                            <button
                                                key={colorName}
                                                type="button"
                                                onClick={() => setSelectedColor(colorName)}
                                                className={`btn btn-sm rounded-3 px-3 py-2 fw-bold ${
                                                    isSelected ? 'btn-dark text-white' : 'btn-outline-secondary'
                                                }`}
                                            >
                                                {colorName}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="form-label fw-semibold text-dark d-block mb-2">
                                Size khung:
                            </label>
                            <div className="d-flex flex-wrap gap-2">
                                {availableSizes.map((size) => {
                                    const isSelected = selectedSize === size;
                                    return (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setSelectedSize(size)}
                                            className={`btn px-3 py-2 fw-bold rounded-3 ${
                                                isSelected ? 'btn-dark text-white' : 'btn-outline-secondary'
                                            }`}
                                            style={{ minWidth: '50px' }}
                                        >
                                            {size}
                                        </button>
                                    );
                                })}
                            </div>
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
                                        type="text"
                                        className="form-control text-center shadow-none p-0"
                                        value={quantity}
                                        readOnly
                                        style={{ textAlign: 'center', backgroundColor: '#fff' }}
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
                                    <small className="text-danger fw-semibold">
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

                {/* Thanh tab: mobile xếp dọc căn giữa tô nền tab chọn, laptop thanh ngang gạch chân trắng */}
                <div className="mt-5">
                    <div className="detail-tab-bar">
                        <button
                            type="button"
                            onClick={() => setActiveTab('description')}
                            className={`detail-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                        >
                            MÔ TẢ SẢN PHẨM
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('warranty')}
                            className={`detail-tab-btn ${activeTab === 'warranty' ? 'active' : ''}`}
                        >
                            BẢO HÀNH ĐỔI TRẢ
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('reviews')}
                            className={`detail-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                        >
                            ĐÁNH GIÁ ({reviews.length})
                        </button>
                    </div>

                    <div className="pt-4">
                        {activeTab === 'description' && (
                            <div className="text-dark">
                                {Object.entries(specGroups).map(([groupTitle, items]) => (
                                    <div key={groupTitle} className="mb-3">
                                        <h6 className="fw-bold text-dark mb-2">{groupTitle}:</h6>
                                        <ul className="mb-3 ps-4">
                                            {Object.entries(items).map(([label, value]) => (
                                                <li key={label} className="mb-2 text-secondary">
                                                    <strong className="text-dark">{label}:</strong> {value}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}

                                {bike.description && (
                                    <div className={Object.keys(specGroups).length > 0 ? 'mt-3 pt-3 border-top' : ''}>
                                        <h6 className="fw-bold text-dark mb-2">Giới thiệu thêm:</h6>
                                        <p className="text-secondary mb-0">{bike.description}</p>
                                    </div>
                                )}

                                {Object.keys(specGroups).length === 0 && !bike.description && (
                                    <p className="text-muted mb-0">Chưa có thông tin mô tả cho sản phẩm này.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'warranty' && (
                            <div className="text-secondary">
                                <h6 className="fw-bold text-dark mb-2">1. Chính sách bảo hành chính hãng:</h6>
                                <ul className="mb-3 ps-4">
                                    <li className="mb-2">
                                        <strong className="text-dark">Khung sườn xe:</strong> Bảo hành chính hãng <strong>05 năm</strong> đối với các lỗi nứt, gãy mối hàn do nhà sản xuất.
                                    </li>
                                    <li className="mb-2">
                                        <strong className="text-dark">Bộ truyền động, phuộc, phanh:</strong> Bảo hành <strong>12 tháng</strong> theo tiêu chuẩn của hãng.
                                    </li>
                                    <li className="mb-2">
                                        <strong className="text-dark">Bảo dưỡng miễn phí:</strong> Miễn phí cân chỉnh phanh, đề và tra dầu định kỳ trong <strong>12 tháng đầu</strong> tại hệ thống cửa hàng BikeShop.
                                    </li>
                                </ul>

                                <h6 className="fw-bold text-dark mb-2">2. Chính sách đổi trả sản phẩm:</h6>
                                <ul className="mb-0 ps-4">
                                    <li className="mb-2">
                                        Đổi mới <strong>1 đổi 1 trong vòng 7 ngày</strong> đầu tiên nếu phát sinh lỗi kỹ thuật từ nhà sản xuất.
                                    </li>
                                    <li className="mb-2">
                                        Sản phẩm đổi trả cần giữ nguyên tình trạng ban đầu, chưa trầy xước, đầy đủ phụ kiện và hóa đơn mua hàng.
                                    </li>
                                    <li>
                                        Không áp dụng bảo hành đối với các hao mòn tự nhiên (săm, lốp, má phanh, dây cáp) hoặc hư hỏng do tai nạn, sử dụng sai mục đích.
                                    </li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                {user ? (
                                    <form onSubmit={handleSubmitReview} className="p-3 bg-light rounded-3 border mb-4">
                                        <h6 className="fw-bold text-dark mb-2">
                                            Viết đánh giá của bạn ({user.name || user.fullName || user.username || user.email})
                                        </h6>
                                        <div className="mb-2 d-flex align-items-center gap-2">
                                            <span className="small text-muted">Chọn số sao:</span>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRatingInput(star)}
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                >
                                                    <i
                                                        className={`fa-solid fa-star fs-5 ${
                                                            star <= ratingInput ? 'text-warning' : 'text-secondary opacity-25'
                                                        }`}
                                                    ></i>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mb-2">
                                            <textarea
                                                className="form-control shadow-none"
                                                rows={3}
                                                placeholder="Chia sẻ cảm nhận của bạn về chiếc xe này..."
                                                value={commentInput}
                                                onChange={(e) => setCommentInput(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-success btn-sm px-4 fw-semibold">
                                            Gửi đánh giá
                                        </button>
                                    </form>
                                ) : (
                                    <div className="p-3 bg-light rounded-3 border mb-4 d-flex flex-wrap align-items-center justify-content-between gap-2">
                                        <span className="text-muted">
                                            <i className="fa-solid fa-lock me-2"></i>
                                            Vui lòng <strong>đăng nhập</strong> để gửi đánh giá cho sản phẩm này.
                                        </span>
                                        {openLoginModal && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={openLoginModal}
                                            >
                                                Đăng nhập ngay
                                            </button>
                                        )}
                                    </div>
                                )}

                                <div className="d-flex flex-column gap-3">
                                    {reviews.map((rev) => (
                                        <div key={rev.id} className="p-3 border rounded-3 bg-white">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <div className="d-flex align-items-center gap-2">
                                                    {rev.avatar ? (
                                                        <img
                                                            src={rev.avatar}
                                                            alt={rev.userName}
                                                            className="rounded-circle object-fit-cover border"
                                                            style={{ width: '32px', height: '32px' }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="rounded-circle bg-dark text-white d-flex align-items-center justify-content-center fw-bold small flex-shrink-0"
                                                            style={{ width: '32px', height: '32px' }}
                                                        >
                                                            {rev.userName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <strong className="text-dark">{rev.userName}</strong>
                                                </div>
                                                <small className="text-muted">{rev.date}</small>
                                            </div>
                                            <div className="mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i
                                                        key={star}
                                                        className={`fa-solid fa-star small me-1 ${
                                                            star <= rev.rating ? 'text-warning' : 'text-secondary opacity-25'
                                                        }`}
                                                    ></i>
                                                ))}
                                            </div>
                                            <p className="text-secondary small mb-0">{rev.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}