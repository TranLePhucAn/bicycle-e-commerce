import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import type { CheckoutItem } from '../../services/checkoutService';
import {
    normalizeCouponCode,
    isCouponCodeValid,
    getCouponDiscount,
    getShippingFee,
} from '../../services/couponService';
import bikesData from '../../data/bikes.json';

interface CartProps {
    onContinueShopping: () => void;
    onCheckout: (items: CheckoutItem[]) => void;
}

export default function Cart({ onContinueShopping, onCheckout }: CartProps) {
    const {
        cartItems,
        selectedIds,
        totalCount,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleItem,
        toggleAll,
    } = useCart();

    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [couponMessage, setCouponMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

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

    const selectedItems = cartItems.filter((item) => selectedIds.includes(item.id));
    const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const discount = getCouponDiscount(appliedCoupon, subtotal);
    const shippingFee = selectedItems.length > 0 ? getShippingFee('standard', appliedCoupon) : 0;
    const finalTotal = Math.max(0, subtotal - discount + shippingFee);

    const overStockItems = selectedItems.filter((item) => {
        const stock = getStock(item.originalBikeId, item.id);
        return item.quantity > stock;
    });
    const hasStockError = overStockItems.length > 0;

    const handleApplyCoupon = (e: React.FormEvent) => {
        e.preventDefault();
        const code = normalizeCouponCode(couponInput);
        if (!code) {
            setAppliedCoupon('');
            setCouponMessage(null);
            return;
        }
        if (!isCouponCodeValid(code)) {
            setAppliedCoupon('');
            setCouponMessage({
                text: 'Mã giảm giá không hợp lệ. Hãy thử BIKE10 hoặc FREESHIP.',
                type: 'danger',
            });
            return;
        }
        setAppliedCoupon(code);
        setCouponMessage({
            text: code === 'BIKE10' ? 'Áp dụng thành công: Giảm 10% tiền sản phẩm!' : 'Áp dụng thành công: Miễn phí vận chuyển!',
            type: 'success',
        });
    };

    return (
        <section className="container py-5">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bold text-dark m-0">
                        <i className="fa-solid fa-cart-shopping me-2 text-primary"></i>
                        Giỏ Hàng Của Bạn
                    </h3>
                    <small className="text-muted">Đã chọn {selectedCount} / {totalCount} sản phẩm</small>
                </div>
                <div className="d-flex flex-wrap gap-2">
                    {cartItems.length > 0 && (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearCart}>
                            <i className="fa-solid fa-trash-can me-2"></i>Xóa toàn bộ
                        </button>
                    )}
                    <button
                        type="button"
                        className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
                        onClick={onContinueShopping}
                    >
                        <i className="fa-solid fa-arrow-left"></i>
                        <span>Tiếp tục mua hàng</span>
                    </button>
                </div>
            </div>

            {hasStockError && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                    <i className="fa-solid fa-triangle-exclamation fs-5 flex-shrink-0"></i>
                    <div>
                        <strong>Chú ý tồn kho:</strong> Có <strong>{overStockItems.length}</strong> sản phẩm vượt quá số lượng còn lại trong kho. Vui lòng giảm số lượng để có thể tiến hành thanh toán!
                    </div>
                </div>
            )}

            {cartItems.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3 border">
                    <i className="fa-solid fa-cart-arrow-down fs-1 text-muted mb-3"></i>
                    <h4 className="fw-bold text-secondary">Giỏ hàng của bạn đang trống!</h4>
                    <p className="text-muted">Hãy khám phá các dòng xe đạp cao cấp của BikeShop và thêm vào giỏ.</p>
                    <button type="button" className="btn btn-primary px-4 py-2 mt-2" onClick={onContinueShopping}>
                        Khám Phá Sản Phẩm Ngay
                    </button>
                </div>
            ) : (
                <div className="row g-4">
                    <div className="col-12 col-lg-8">
                        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                            <div className="card-header bg-dark text-white fw-semibold py-3 d-flex justify-content-between align-items-center">
                                <span>Sản phẩm trong giỏ ({cartItems.length})</span>
                                <small className="text-light opacity-75">Tự động kiểm tra số lượng tồn kho</small>
                            </div>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                    <tr>
                                        <th className="text-center" style={{ width: '42px' }}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                aria-label="Chọn tất cả sản phẩm"
                                                checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                                                onChange={toggleAll}
                                            />
                                        </th>
                                        <th style={{ width: '42%' }}>Sản phẩm</th>
                                        <th>Đơn giá</th>
                                        <th style={{ width: '130px' }} className="text-center">Số lượng</th>
                                        <th>Thành tiền</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {cartItems.map((item: any) => {
                                        const stock = getStock(item.originalBikeId, item.id);
                                        const isOver = item.quantity > stock;

                                        return (
                                            <tr key={item.id} className={isOver ? 'table-danger' : ''}>
                                                <td className="text-center">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        aria-label={`Chọn ${item.name}`}
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={() => toggleItem(item.id)}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <img
                                                            src={item.image?.startsWith('/') || item.image?.startsWith('http')
                                                                ? item.image
                                                                : `/src/assets/images/${item.image}`}
                                                            alt={item.name}
                                                            className="rounded"
                                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src =
                                                                    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80';
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="fw-bold text-dark">{item.name}</div>
                                                            {(item.selectedSize || item.selectedColor) && (
                                                                <small className="text-muted d-block mt-1">
                                                                    {[
                                                                        item.selectedSize ? `Size: ${item.selectedSize}` : '',
                                                                        item.selectedColor ? `Màu: ${item.selectedColor}` : '',
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(', ')}
                                                                </small>
                                                            )}
                                                            {isOver ? (
                                                                <small className="text-danger fw-bold d-block mt-1">
                                                                    <i className="fa-solid fa-triangle-exclamation me-1"></i>
                                                                    Vượt tồn kho! Chỉ còn {stock} chiếc (bạn chọn {item.quantity})
                                                                </small>
                                                            ) : (
                                                                <small className="text-success d-block mt-1">
                                                                    Còn {stock} chiếc trong kho
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="fw-semibold">
                                                    {item.price.toLocaleString('vi-VN')} đ
                                                </td>
                                                <td>
                                                    <div className="input-group input-group-sm justify-content-center">
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            type="button"
                                                            disabled={item.quantity <= 1}
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                        >
                                                            -
                                                        </button>
                                                        <span className={`input-group-text px-3 bg-white fw-bold ${isOver ? 'text-danger border-danger' : ''}`}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            disabled={item.quantity >= stock}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="fw-bold text-danger">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                                </td>
                                                <td className="text-end pe-3">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger border-0"
                                                        title="Xóa sản phẩm"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        <i className="fa-solid fa-trash-can"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-lg-4">
                        {/* Coupon card */}
                        <div className="card shadow-sm border-0 rounded-3 mb-4">
                            <div className="card-header bg-white fw-semibold py-3 border-bottom">
                                <i className="fa-solid fa-ticket me-2 text-warning"></i> Mã Giảm Giá
                            </div>
                            <div className="card-body p-3">
                                <form onSubmit={handleApplyCoupon} className="d-flex gap-2">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm text-uppercase"
                                        placeholder="Nhập mã (BIKE10, FREESHIP)..."
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                    />
                                    <button type="submit" className="btn btn-dark btn-sm text-nowrap px-3">
                                        Áp dụng
                                    </button>
                                </form>
                                {couponMessage && (
                                    <div className={`alert alert-${couponMessage.type} py-2 px-3 small mt-2 mb-0`}>
                                        {couponMessage.text}
                                    </div>
                                )}
                                <div className="mt-2 text-muted" style={{ fontSize: '11px' }}>
                                    Gợi ý mã: <span className="badge bg-light text-dark border me-1">BIKE10</span> (giảm 10%) | <span className="badge bg-light text-dark border">FREESHIP</span> (miễn phí ship)
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="card shadow-sm border-0 rounded-3">
                            <div className="card-header bg-dark text-white fw-semibold py-3">
                                Tóm tắt thanh toán
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Tạm tính ({selectedCount} món):</span>
                                    <span className="fw-semibold">{subtotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                {discount > 0 && (
                                    <div className="d-flex justify-content-between mb-2 text-success">
                                        <span>Giảm giá ({appliedCoupon}):</span>
                                        <span className="fw-bold">-{discount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Phí giao hàng:</span>
                                    <span className="fw-semibold">
                                        {shippingFee === 0 && selectedItems.length > 0 ? (
                                            <span className="text-success fw-bold">Miễn phí</span>
                                        ) : (
                                            `${shippingFee.toLocaleString('vi-VN')} đ`
                                        )}
                                    </span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="fw-bold fs-5">Tổng cộng:</span>
                                    <span className="fw-bold text-danger fs-4">
                                        {finalTotal.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>

                                {hasStockError && (
                                    <div className="alert alert-warning small py-2 mb-3">
                                        ⚠️ Vui lòng điều chỉnh số lượng các món vượt tồn kho để tiếp tục thanh toán.
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mb-2"
                                    onClick={() => onCheckout(selectedItems)}
                                    disabled={selectedItems.length === 0 || hasStockError}
                                >
                                    Tiến Hành Thanh Toán
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100 py-2 rounded-3"
                                    onClick={onContinueShopping}
                                >
                                    Tiếp tục mua hàng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
