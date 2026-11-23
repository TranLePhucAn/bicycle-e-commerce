import React, { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { getCouponDiscount, getShippingFee, isCouponCodeValid, normalizeCouponCode } from '../../services/couponService';
import { checkCartStock } from '../../services/inventoryApi';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onViewCart: () => void;
    onCheckout: (items: Array<{ id: string; name: string; price: number; quantity: number; image?: string }>, couponCode: string) => void;
}

export default function CartDrawer({ isOpen, onClose, onViewCart, onCheckout }: CartDrawerProps) {
    const { cartItems, totalCount, subtotal, updateQuantity, removeFromCart } = useCart();
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [liveStock, setLiveStock] = useState<Record<string, number>>({});
    const [isCheckingStock, setIsCheckingStock] = useState(false);
    const [stockCheckError, setStockCheckError] = useState(false);
    const discount = getCouponDiscount(appliedCoupon, subtotal);
    const shippingFee = cartItems.length > 0 ? getShippingFee('standard', appliedCoupon) : 0;
    const total = Math.max(0, subtotal - discount + shippingFee);

    useEffect(() => {
        if (!isOpen || cartItems.length === 0) {
            if (cartItems.length === 0) setLiveStock({});
            setIsCheckingStock(false);
            return;
        }

        let isActive = true;
        setIsCheckingStock(true);
        setStockCheckError(false);
        checkCartStock(cartItems.map((item) => ({
            id: item.originalBikeId || item.id,
            name: item.name,
            quantity: item.quantity,
        })))
            .then((results) => {
                if (isActive) setLiveStock(Object.fromEntries(results.map((item) => [item.id, item.available])));
            })
            .catch(() => {
                if (isActive) setStockCheckError(true);
            })
            .finally(() => {
                if (isActive) setIsCheckingStock(false);
            });

        return () => { isActive = false; };
    }, [isOpen, cartItems]);

    const handleApplyCoupon = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const code = normalizeCouponCode(couponInput);
        if (!code) {
            setAppliedCoupon('');
            setCouponMessage('');
            return;
        }
        if (!isCouponCodeValid(code)) {
            setAppliedCoupon('');
            setCouponMessage('Mã không hợp lệ. Hãy thử BIKE10 hoặc FREESHIP.');
            return;
        }
        setAppliedCoupon(code);
        setCouponMessage(code === 'BIKE10' ? 'Đã giảm 10% tiền sản phẩm.' : 'Đã miễn phí vận chuyển.');
    };

    const getStock = (originalBikeId?: string, id?: string, lastKnownStock?: number) => {
        const targetId = originalBikeId || id;
        return (targetId ? liveStock[targetId] : undefined) ?? lastKnownStock ?? 0;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                style={{ zIndex: 1050, transition: 'opacity 0.3s ease' }}
                onClick={onClose}
            ></div>

            {/* Offcanvas Drawer panel */}
            <div
                className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    zIndex: 1055,
                    animation: 'slideInRight 0.3s ease-out forwards',
                }}
            >
                {/* Header */}
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                    <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-bag-shopping fs-5 text-primary"></i>
                        <h5 className="fw-bold m-0 text-dark">Giỏ Hàng ({totalCount})</h5>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={onClose}
                        aria-label="Đóng"
                    ></button>
                </div>

                {/* Items List */}
                <div className="flex-grow-1 overflow-auto p-3">
                    {isCheckingStock && cartItems.length > 0 && (
                        <div className="alert alert-info py-2 small" role="status">Đang kiểm tra tồn kho mới nhất...</div>
                    )}
                    {stockCheckError && cartItems.length > 0 && (
                        <div className="alert alert-warning py-2 small" role="alert">Chưa thể tải tồn kho mới nhất. Hãy kiểm tra kết nối rồi thử lại.</div>
                    )}
                    {cartItems.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fa-solid fa-cart-shopping fs-1 mb-3 opacity-25"></i>
                            <p className="mb-3">Giỏ hàng của bạn đang trống.</p>
                            <button
                                type="button"
                                className="btn btn-outline-dark btn-sm rounded-3"
                                onClick={onClose}
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-3">
                            {cartItems.map((item) => {
                                const stock = getStock(item.originalBikeId, item.id, item.stock);
                                const isOverStock = item.quantity > stock;

                                return (
                                    <div
                                        key={item.id}
                                        className={`p-2 rounded-3 border d-flex gap-3 position-relative ${
                                            isOverStock ? 'border-danger bg-danger-subtle bg-opacity-10' : 'bg-white'
                                        }`}
                                    >
                                        <img
                                            src={item.image || '/src/assets/images/bike01.png'}
                                            alt={item.name}
                                            className="rounded object-fit-contain bg-light border p-1"
                                            style={{ width: '70px', height: '70px' }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80';
                                            }}
                                        />

                                        <div className="flex-grow-1 d-flex flex-column justify-content-between">
                                            <div>
                                                <div className="d-flex justify-content-between align-items-start gap-1">
                                                    <h6 className="fw-semibold text-dark mb-1 small text-truncate" style={{ maxWidth: '180px' }}>
                                                        {item.name}
                                                    </h6>
                                                    <button
                                                        type="button"
                                                        className="btn btn-link text-danger p-0 border-0"
                                                        onClick={() => removeFromCart(item.id)}
                                                        title="Xóa"
                                                    >
                                                        <i className="fa-solid fa-trash-can small"></i>
                                                    </button>
                                                </div>

                                                {(item.selectedSize || item.selectedColor) && (
                                                    <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                                                        {[
                                                            item.selectedSize ? `Size: ${item.selectedSize}` : '',
                                                            item.selectedColor ? `Màu: ${item.selectedColor}` : '',
                                                        ].filter(Boolean).join(' | ')}
                                                    </small>
                                                )}

                                                <div className="fw-bold text-danger small mt-1">
                                                    {item.price.toLocaleString('vi-VN')} đ
                                                </div>
                                            </div>

                                            {isOverStock && (
                                                <small className="text-danger fw-semibold" style={{ fontSize: '11px' }}>
                                                    ⚠️ Chỉ còn {stock} chiếc trong kho!
                                                </small>
                                            )}

                                            <div className="d-flex align-items-center justify-content-between mt-2">
                                                <div className="input-group input-group-sm" style={{ width: '90px' }}>
                                                    <button
                                                        className="btn btn-outline-secondary px-2 py-0"
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="input-group-text bg-white justify-content-center px-2 py-0 fw-bold small flex-grow-1">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        className="btn btn-outline-secondary px-2 py-0"
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, 1)}
                                                        disabled={isCheckingStock || stockCheckError || item.quantity >= stock}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <span className="fw-bold text-dark small">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-3 border-top bg-light">
                        <form onSubmit={handleApplyCoupon} className="mb-3">
                            <label className="form-label small fw-semibold mb-1" htmlFor="drawer-coupon">Mã giảm giá</label>
                            <div className="input-group input-group-sm">
                                <input id="drawer-coupon" className="form-control" value={couponInput}
                                    onChange={(event) => setCouponInput(event.target.value)} placeholder="BIKE10 hoặc FREESHIP" />
                                <button type="submit" className="btn btn-outline-primary">Áp dụng</button>
                            </div>
                            {couponMessage && <small className={`d-block mt-1 ${appliedCoupon ? 'text-success' : 'text-danger'}`} role="status">{couponMessage}</small>}
                        </form>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted fw-semibold">Tạm tính:</span>
                            <span className="fw-bold fs-5 text-danger">{subtotal.toLocaleString('vi-VN')} đ</span>
                        </div>
                        {discount > 0 && (
                            <div className="d-flex justify-content-between small mb-2">
                                <span>Giảm giá:</span><span>-{discount.toLocaleString('vi-VN')} đ</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between small mb-2">
                            <span>Phí giao hàng:</span>
                            <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-3 pt-2 border-top">
                            <span className="fw-bold">Tổng cộng:</span>
                            <span className="fw-bold fs-5 text-danger">{total.toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div className="d-grid gap-2">
                            <button
                                type="button"
                                className="btn btn-dark fw-bold py-2"
                                onClick={() => {
                                    onClose();
                                    onCheckout(cartItems.map((item) => ({
                                        id: item.originalBikeId || item.id,
                                        name: item.name,
                                        price: item.price,
                                        quantity: item.quantity,
                                        image: item.image,
                                    })), appliedCoupon);
                                }}
                                disabled={isCheckingStock || stockCheckError || cartItems.some((item) => item.quantity > getStock(item.originalBikeId, item.id, item.stock))}
                            >
                                <i className="fa-solid fa-credit-card me-2"></i>Tiến Hành Thanh Toán
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary fw-semibold py-2"
                                onClick={() => {
                                    onClose();
                                    onViewCart();
                                }}
                            >
                                Xem Giỏ Hàng Chi Tiết
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    );
}
