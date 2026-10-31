import React from 'react';

interface OrderHistoryProps {
    onContinueShopping: () => void;
}

export default function OrderHistory({ onContinueShopping }: OrderHistoryProps) {
    const orders = [
        {
            orderId: 'DH-20261025-01',
            date: '25/10/2026',
            status: 'Giao hàng thành công',
            statusClass: 'bg-success',
            paymentMethod: 'Chuyển khoản ngân hàng (VNPAY)',
            totalAmount: 8500000,
            items: [
                {
                    name: 'Giant ATX - Xe địa hình (MTB)',
                    quantity: 1,
                    price: 8500000,
                },
            ],
        },
        {
            orderId: 'DH-20261012-02',
            date: '12/10/2026',
            status: 'Đang vận chuyển',
            statusClass: 'bg-warning text-dark',
            paymentMethod: 'Thanh toán khi nhận hàng (COD)',
            totalAmount: 14200000,
            items: [
                {
                    name: 'Twitter R10 - Xe đạp đua',
                    quantity: 1,
                    price: 14200000,
                },
            ],
        },
        {
            orderId: 'DH-20260930-03',
            date: '30/09/2026',
            status: 'Đã hủy',
            statusClass: 'bg-secondary',
            paymentMethod: 'Thanh toán khi nhận hàng (COD)',
            totalAmount: 5800000,
            items: [
                {
                    name: 'Trinx Free - Xe đường phố (Touring)',
                    quantity: 1,
                    price: 5800000,
                },
            ],
        },
    ];

    return (
        <section className="container py-5">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bold text-dark m-0">
                        <i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>
                        Lịch Sử Đơn Hàng
                    </h3>
                    <small className="text-muted">Theo dõi và tra cứu tiến trình các đơn hàng đã mua tại BikeShop</small>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2"
                    onClick={onContinueShopping}
                >
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Về trang chủ</span>
                </button>
            </div>

            {/* Danh sách đơn hàng */}
            <div className="d-flex flex-column gap-4">
                {orders.map(order => (
                    <div key={order.orderId} className="card shadow-sm border-0 rounded-3 overflow-hidden">
                        <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-bold text-dark">Mã đơn: {order.orderId}</span>
                                <span className="text-muted small">| Ngày đặt: {order.date}</span>
                            </div>
                            <span className={`badge px-3 py-2 ${order.statusClass}`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table align-middle mb-0">
                                    <thead className="table-light">
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th className="text-center">Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th className="text-end">Tạm tính</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {order.items.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-semibold text-dark">{item.name}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td>{item.price.toLocaleString('vi-VN')} đ</td>
                                            <td className="text-end fw-bold">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <hr />

                            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
                                <small className="text-muted">
                                    Hình thức: <span className="fw-semibold text-dark">{order.paymentMethod}</span>
                                </small>
                                <div className="text-end">
                                    <span className="me-2 text-muted">Tổng thanh toán:</span>
                                    <span className="fw-bold text-danger fs-5">
                                        {order.totalAmount.toLocaleString('vi-VN')} đ
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="card-footer bg-white border-top-0 d-flex justify-content-end gap-2 pb-3">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => alert(`Xem chi tiết đơn hàng: ${order.orderId}`)}
                            >
                                <i className="fa-regular fa-file-lines me-1"></i>
                                Chi tiết
                            </button>
                            <button
                                type="button"
                                className="btn btn-sm btn-dark"
                                onClick={onContinueShopping}
                            >
                                <i className="fa-solid fa-cart-shopping me-1"></i>
                                Mua lại
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
