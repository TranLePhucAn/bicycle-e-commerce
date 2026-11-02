import React, { useState } from 'react';

interface CartProps {
    onContinueShopping: () => void;
}

export default function Cart({ onContinueShopping }: CartProps) {
    const [cartItems, setCartItems] = useState([
        {
            id: 'BK-001',
            name: 'Giant ATX - Xe địa hình (MTB)',
            price: 8500000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=300&q=80',
        },
        {
            id: 'BK-003',
            name: 'Trinx Free - Xe đường phố (Touring)',
            price: 5800000,
            quantity: 2,
            image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=300&q=80',
        },
    ]);

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev =>
            prev
                .map(item => {
                    if (item.id === id) {
                        const newQty = item.quantity + delta;
                        return newQty > 0 ? { ...item, quantity: newQty } : null;
                    }
                    return item;
                })
                .filter(Boolean) as typeof cartItems
        );
    };

    const removeItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = cartItems.length > 0 ? 150000 : 0;
    const total = subtotal + shipping;

    return (
        <section className="container py-5">
            {/* Breadcrumb / Tiêu đề */}
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bold text-dark m-0">
                        <i className="fa-solid fa-cart-shopping me-2 text-primary"></i>
                        Giỏ Hàng Của Bạn
                    </h3>
                    <small className="text-muted">Quản lý và kiểm tra danh sách sản phẩm trước khi thanh toán</small>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
                    onClick={onContinueShopping}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Tiếp tục mua hàng</span>
                </button>
            </div>

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
                    {/* Danh sách sản phẩm trong giỏ */}
                    <div className="col-12 col-lg-8">
                        <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
                            <div className="card-header bg-dark text-white fw-semibold py-3">
                                Sản phẩm đã chọn ({cartItems.length})
                            </div>
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                    <tr>
                                        <th style={{ width: '45%' }}>Sản phẩm</th>
                                        <th>Đơn giá</th>
                                        <th style={{ width: '130px' }} className="text-center">Số lượng</th>
                                        <th>Thành tiền</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {cartItems.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="rounded"
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                    />
                                                    <div>
                                                        <div className="fw-bold text-dark">{item.name}</div>
                                                        <small className="text-muted">Mã: {item.id}</small>
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
                                                        onClick={() => updateQuantity(item.id, -1)}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="input-group-text px-3 bg-white fw-bold">
                                                            {item.quantity}
                                                        </span>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, 1)}
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
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Tóm tắt đơn hàng */}
                    <div className="col-12 col-lg-4">
                        <div className="card shadow-sm border-0 rounded-3">
                            <div className="card-header bg-dark text-white fw-semibold py-3">
                                Tóm tắt thanh toán
                            </div>
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Tạm tính:</span>
                                    <span className="fw-semibold">{subtotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">Phí giao hàng:</span>
                                    <span className="fw-semibold">{shipping.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="fw-bold fs-5">Tổng cộng:</span>
                                    <span className="fw-bold text-danger fs-4">
                                        {total.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mb-2"
                                    onClick={() => alert('Chức năng đặt hàng đang được hoàn thiện ở tuần tiếp theo!')}
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
