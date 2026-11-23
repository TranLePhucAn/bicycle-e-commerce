import { createPortal } from 'react-dom';
import { getOrderStatus, type OrderRecord } from '../../services/checkoutService';
import '../../styles/invoicemodal.css';

interface InvoiceModalProps {
    order: OrderRecord | null;
    customerName?: string;
    onClose: () => void;
}

const formatPrice = (amount: number) => `${amount.toLocaleString('vi-VN')} đ`;

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Không rõ' : date.toLocaleString('vi-VN');
}

const PAYMENT_LABELS: Record<string, string> = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank: 'Chuyển khoản ngân hàng',
    banking: 'Chuyển khoản ngân hàng',
    transfer: 'Chuyển khoản ngân hàng',
    momo: 'Ví điện tử MoMo',
    vnpay: 'Cổng thanh toán VNPAY',
    card: 'Thẻ tín dụng / Ghi nợ',
};

const DELIVERY_LABELS: Record<string, string> = {
    standard: 'Giao hàng tiêu chuẩn',
    express: 'Giao hàng hỏa tốc',
    pickup: 'Nhận tại cửa hàng',
};

export default function InvoiceModal({ order, customerName, onClose }: InvoiceModalProps) {
    if (!order) return null;

    const status = getOrderStatus(order);
    const paymentKey = String(order.paymentMethod || 'cod').toLowerCase();
    const deliveryKey = String(order.deliveryMethod || 'standard').toLowerCase();
    const paymentLabel =
        PAYMENT_LABELS[paymentKey] || String(order.paymentMethod || 'Thanh toán khi nhận hàng (COD)');
    const deliveryLabel =
        DELIVERY_LABELS[deliveryKey] || String(order.deliveryMethod || 'Giao hàng tiêu chuẩn');

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div
            className="modal fade show d-block invoice-print-portal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-modal-title"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 1060 }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable invoice-print-dialog">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden invoice-print-content">
                    <div className="modal-header bg-dark text-white no-print">
                        <h5 id="invoice-modal-title" className="modal-title fw-bold">
                            <i className="fa-solid fa-file-invoice me-2"></i>
                            Xem trước hóa đơn #{order.id}
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Đóng"
                            onClick={onClose}
                        />
                    </div>

                    <div className="modal-body p-4 p-md-5 bg-white invoice-print-body" id="printable-invoice-area">
                        <div className="d-flex justify-content-between align-items-start border-bottom border-2 border-dark pb-3 mb-4 gap-3 flex-wrap">
                            <div>
                                <div className="fw-bold fs-3 text-dark">🚲 BIKESHOP</div>
                                <div className="text-muted small">PHÂN PHỐI XE ĐẠP CHÍNH HÃNG</div>
                                <div className="text-muted small">Hotline: 1900 6868 • Website: bikeshop.vn</div>
                            </div>
                            <div className="text-md-end">
                                <h4 className="fw-bold text-uppercase text-dark mb-1">Hóa Đơn Bán Hàng</h4>
                                <div className="small text-secondary">
                                    Mã đơn: <strong className="text-dark">{order.id}</strong>
                                </div>
                                <div className="small text-secondary">
                                    Ngày đặt: {formatDate(order.createdAt)}
                                </div>
                                <div className="small text-secondary">
                                    Trạng thái: <strong className="text-dark">{status}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-6">
                                <div className="p-3 bg-light rounded-3 border h-100">
                                    <div className="fw-bold text-uppercase small text-secondary mb-2">
                                        Thông tin người nhận
                                    </div>
                                    <div className="fw-bold text-dark">
                                        {order.recipient?.name || customerName || 'Khách hàng'}
                                    </div>
                                    <div className="small text-secondary">
                                        Điện thoại: {order.recipient?.phone || '—'}
                                    </div>
                                    <div className="small text-secondary">
                                        Email: {order.recipient?.email || order.userEmail || '—'}
                                    </div>
                                    <div className="small text-secondary">
                                        Địa chỉ: {order.recipient?.address || '—'}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 bg-light rounded-3 border h-100">
                                    <div className="fw-bold text-uppercase small text-secondary mb-2">
                                        Thanh toán & Vận chuyển
                                    </div>
                                    <div className="small text-secondary">
                                        Giao hàng: <strong className="text-dark">{deliveryLabel}</strong>
                                    </div>
                                    <div className="small text-secondary">
                                        Thanh toán: <strong className="text-dark">{paymentLabel}</strong>
                                    </div>
                                    {order.couponCode && (
                                        <div className="small text-secondary">
                                            Mã ưu đãi: <strong className="text-success">{order.couponCode}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive mb-4">
                            <table className="table table-bordered align-middle mb-0">
                                <thead className="table-dark">
                                <tr>
                                    <th className="text-center" style={{ width: '55px' }}>STT</th>
                                    <th>Sản phẩm</th>
                                    <th className="text-center" style={{ width: '70px' }}>SL</th>
                                    <th className="text-end" style={{ width: '140px' }}>Đơn giá</th>
                                    <th className="text-end" style={{ width: '150px' }}>Thành tiền</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items.map((item, idx) => {
                                    const variant = [
                                        (item as any).selectedSize ? `Size ${(item as any).selectedSize}` : '',
                                        (item as any).selectedColor || '',
                                    ]
                                        .filter(Boolean)
                                        .join(' - ');

                                    return (
                                        <tr key={`${item.id}-${idx}`}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td>
                                                <div className="fw-semibold text-dark">{item.name}</div>
                                                {variant && (
                                                    <small className="text-muted">{variant}</small>
                                                )}
                                            </td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end text-nowrap">{formatPrice(item.price)}</td>
                                            <td className="text-end fw-semibold text-nowrap">
                                                {formatPrice(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        <div className="ms-auto" style={{ maxWidth: '320px' }}>
                            <div className="d-flex justify-content-between py-1 small">
                                <span className="text-muted">Tạm tính:</span>
                                <span className="fw-semibold">{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 small">
                                <span className="text-muted">Giảm giá:</span>
                                <span className="text-success">-{formatPrice(order.discount || 0)}</span>
                            </div>
                            <div className="d-flex justify-content-between py-1 small">
                                <span className="text-muted">Phí vận chuyển:</span>
                                <span>{order.shipping === 0 ? 'Miễn phí' : formatPrice(order.shipping)}</span>
                            </div>
                            <div className="d-flex justify-content-between border-top border-2 border-dark mt-2 pt-2">
                                <span className="fw-bold text-dark">Tổng thanh toán:</span>
                                <span className="fw-bold fs-5 text-danger">{formatPrice(order.total)}</span>
                            </div>
                        </div>

                        <div className="text-center text-muted small border-top mt-4 pt-3">
                            Cảm ơn quý khách đã tin tưởng và mua sắm tại BikeShop!
                            <br />
                            Vui lòng giữ lại hóa đơn để được hỗ trợ bảo hành và đổi trả sản phẩm.
                        </div>
                    </div>

                    <div className="modal-footer bg-light no-print">
                        <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                            Đóng
                        </button>
                        <button type="button" className="btn btn-dark px-4 fw-semibold" onClick={handlePrint}>
                            <i className="fa-solid fa-print me-2"></i>In hóa đơn / Lưu PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}