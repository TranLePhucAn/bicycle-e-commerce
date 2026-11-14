import React from 'react';
import { useCart } from '../../context/CartContext';
import bikesData from '../../data/bikes.json';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onViewCart: () => void;
    onCheckout: () => void;
}

export default function CartDrawer({ isOpen, onClose, onViewCart, onCheckout }: CartDrawerProps) {
    const { cartItems, totalCount, subtotal, updateQuantity, removeFromCart } = useCart();

    const getStock = (originalBikeId?: string, id?: string) => {
        try {
            const stockMap = JSON.parse(localStorage.getItem('bike_stock') || '{}');
            const targetId = originalBikeId || id;
            if (targetId && stockMap[targetId] !== undefined) return stockMap[targetId];
            const found = bikesData.find((b) => b.id === targetId);
            return found ? found.stock : 99;
        } catch {
            return 99;
        }
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
                                const stock = getStock(item.originalBikeId, item.id);
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
                                                        disabled={item.quantity >= stock}
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
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted fw-semibold">Tạm tính:</span>
                            <span className="fw-bold fs-5 text-danger">{subtotal.toLocaleString('vi-VN')} đ</span>
                        </div>

                        <div className="d-grid gap-2">
                            <button
                                type="button"
                                className="btn btn-dark fw-bold py-2"
                                onClick={() => {
                                    onClose();
                                    onCheckout();
                                }}
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
