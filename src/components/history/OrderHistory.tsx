import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrders, type OrderRecord } from '../../services/checkoutService';

interface OrderHistoryProps {
    onContinueShopping: () => void;
}

function getStatusClass(status: OrderRecord['status']) {
    if (status === 'Giao hàng thành công') return 'bg-success';
    if (status === 'Đang vận chuyển' || status === 'Đang chuẩn bị') return 'bg-warning text-dark';
    return 'bg-primary';
}

function getPaymentName(method: OrderRecord['paymentMethod']) {
    if (method === 'cod') return 'Thanh toán khi nhận hàng (COD)';
    if (method === 'qr') return 'QR tĩnh (mô phỏng)';
    return 'Thẻ ngân hàng (mô phỏng)';
}

export default function OrderHistory({ onContinueShopping }: OrderHistoryProps) {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;
        getOrders()
            .then((result) => {
                if (isActive) setOrders(result);
            })
            .catch((caught: Error) => {
                if (isActive) setError(caught.message || 'Không thể tải lịch sử đơn hàng.');
            })
            .finally(() => {
                if (isActive) setIsLoading(false);
            });

        return () => { isActive = false; };
    }, []);

    return (
        <section className="container py-5">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 flex-wrap gap-2">
                <div>
                    <h3 className="fw-bold text-dark m-0">
                        <i className="fa-solid fa-clock-rotate-left me-2 text-primary"></i>
                        Lịch Sử Đơn Hàng
                    </h3>
                    <small className="text-muted">
                        Đơn hàng của <strong className="text-dark">{user?.name}</strong> ({user?.email})
                    </small>
                </div>
                <button type="button" className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2" onClick={onContinueShopping}>
                    <i className="fa-solid fa-arrow-left"></i>
                    <span>Về trang chủ</span>
                </button>
            </div>

            {isLoading && <p className="text-center text-muted py-5">Đang tải lịch sử đơn hàng...</p>}
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {!isLoading && !error && orders.length === 0 && (
                <div className="text-center text-muted bg-white border rounded-3 py-5">
                    Bạn chưa có đơn hàng nào.
                </div>
            )}

            <div className="d-flex flex-column gap-4">
                {orders.map((order) => (
                    <div key={order.id} className="card shadow-sm border-0 rounded-3 overflow-hidden">
                        <div className="card-header bg-light d-flex flex-wrap justify-content-between align-items-center py-3 border-bottom">
                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-bold text-dark">Mã đơn: {order.id}</span>
                                <span className="text-muted small">| Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <span className={`badge px-3 py-2 ${getStatusClass(order.status)}`}>{order.status}</span>
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
                                        {order.items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="fw-semibold text-dark">{item.name}</td>
                                                <td className="text-center">{item.quantity}</td>
                                                <td>{item.price.toLocaleString('vi-VN')} đ</td>
                                                <td className="text-end fw-bold">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <hr />
                            <div className="d-flex flex-wrap justify-content-between align-items-center mt-3">
                                <small className="text-muted">Hình thức: <span className="fw-semibold text-dark">{getPaymentName(order.paymentMethod)}</span></small>
                                <div className="text-end">
                                    <span className="me-2 text-muted">Tổng thanh toán:</span>
                                    <span className="fw-bold text-danger fs-5">{order.total.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
