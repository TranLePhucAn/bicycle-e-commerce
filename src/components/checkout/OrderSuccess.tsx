import type { OrderRecord } from '../../services/checkoutService';

interface OrderSuccessProps {
    order: OrderRecord;
    onContinueShopping: () => void;
}

export default function OrderSuccess({ order, onContinueShopping }: OrderSuccessProps) {
    return (
        <section className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm text-center p-4">
                        <div className="text-success display-3 mb-3">
                            <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
                        </div>
                        <h2 className="fw-bold">Đặt hàng thành công!</h2>
                        <p className="text-muted">Mã đơn: {order.id}</p>
                        <p>Trạng thái hiện tại: <strong>{order.status}</strong></p>
                        <p className="fw-bold text-danger">{order.total.toLocaleString('vi-VN')} đ</p>
                        <button type="button" className="btn btn-primary align-self-center" onClick={onContinueShopping}>
                            Tiếp tục mua sắm
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
