import { useEffect, useMemo, useState } from 'react';
import DataTable, { Column } from 'datatables.net-react';
import DataTablesBootstrap from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
    advanceOrderStatus,
    cancelOrder,
    getOrderStatus,
    getOrdersForUser,
    type OrderRecord,
    type OrderStatus,
} from '../../services/checkoutService';

DataTable.use(DataTablesBootstrap);

interface OrderHistoryProps {
    onContinueShopping: () => void;
}

const ORDER_STATUSES: OrderStatus[] = [
    'Chờ xác nhận',
    'Đang chuẩn bị',
    'Đang vận chuyển',
    'Giao hàng thành công',
    'Đã hủy',
];
const ACTIVE_STATUSES = ORDER_STATUSES.slice(0, 4);
const formatPrice = (amount: number) => `${amount.toLocaleString('vi-VN')} đ`;

function formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Không rõ' : date.toLocaleString('vi-VN');
}

function getLocalDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getStatusClass(status: OrderStatus): string {
    if (status === 'Giao hàng thành công') return 'bg-success';
    if (status === 'Đã hủy') return 'bg-secondary';
    if (status === 'Đang vận chuyển') return 'bg-warning text-dark';
    return 'bg-primary';
}

export default function OrderHistory({ onContinueShopping }: OrderHistoryProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const isDemoMode = new URLSearchParams(window.location.search).get('demo') === '1';

    useEffect(() => {
        if (!user) return;

        const refreshOrders = () => {
            try {
                setOrders(getOrdersForUser(user.id));
            } catch (error) {
                showToast(error instanceof Error ? error.message : 'Không thể tải lịch sử đơn hàng.', 'danger');
            }
        };

        refreshOrders();
        const intervalId = window.setInterval(refreshOrders, 15000);
        return () => window.clearInterval(intervalId);
    }, [showToast, user]);

    const filteredOrders = useMemo(
        () => orders
            .filter((order) => !statusFilter || getOrderStatus(order) === statusFilter)
            .filter((order) => !fromDate || getLocalDate(order.createdAt) >= fromDate)
            .filter((order) => !toDate || getLocalDate(order.createdAt) <= toDate),
        [fromDate, orders, statusFilter, toDate],
    );
    const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

    const tableOptions = useMemo(() => ({
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25],
        order: [[1, 'desc']] as [number, 'asc' | 'desc'][],
        language: {
            emptyTable: 'Không có đơn hàng trong bộ lọc này.',
            info: 'Đang xem _START_–_END_ trong _TOTAL_ đơn hàng',
            infoEmpty: 'Không có dữ liệu',
            infoFiltered: '(lọc từ _MAX_ đơn hàng)',
            lengthMenu: 'Hiển thị _MENU_ đơn mỗi trang',
            loadingRecords: 'Đang tải...',
            paginate: { first: 'Đầu', last: 'Cuối', next: 'Sau', previous: 'Trước' },
            processing: 'Đang xử lý...',
            search: 'Tìm mã đơn:',
            searchPlaceholder: 'Nhập mã đơn hàng',
            zeroRecords: 'Không tìm thấy đơn hàng phù hợp.',
        },
        columnDefs: [
            { targets: [1, 2, 3, 4, 5], searchable: false },
            { targets: [2, 3, 5], orderable: false },
            { targets: 4, searchable: false, className: 'text-end text-nowrap' },
            { targets: 5, className: 'text-end text-nowrap' },
        ],
    }), []);

    const handleCancelOrder = (order: OrderRecord) => {
        if (!user || !window.confirm(`Bạn có chắc muốn hủy đơn ${order.id}? Tồn kho sẽ được hoàn lại.`)) return;

        try {
            const cancelled = cancelOrder(order.id, user.id);
            setOrders((current) => current.map((item) => item.id === cancelled.id ? cancelled : item));
            showToast('Đã hủy đơn hàng và hoàn tồn kho.', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể hủy đơn hàng.', 'danger');
        }
    };

    const handleAdvanceOrder = (order: OrderRecord) => {
        if (!user) return;

        try {
            const advanced = advanceOrderStatus(order.id, user.id);
            setOrders((current) => current.map((item) => item.id === advanced.id ? advanced : item));
            showToast(`Đã đẩy trạng thái đơn thành ${getOrderStatus(advanced)}.`, 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể đẩy nhanh trạng thái.', 'danger');
        }
    };

    return (
        <section className="container py-5">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3 flex-wrap gap-2">
                <div>
                    <h3 className="fw-bold text-dark m-0">
                        <i className="fa-solid fa-clock-rotate-left me-2 text-primary" aria-hidden="true"></i>
                        Lịch Sử Đơn Hàng
                    </h3>
                    <small className="text-muted">
                        Đơn hàng của <strong className="text-dark">{user?.name}</strong> ({user?.email})
                    </small>
                </div>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={onContinueShopping}>
                    <i className="fa-solid fa-arrow-left me-2" aria-hidden="true"></i>Về trang chủ
                </button>
            </div>

            {selectedOrder ? (
                <OrderDetails
                    order={selectedOrder}
                    isDemoMode={isDemoMode}
                    onBack={() => setSelectedOrderId(null)}
                    onCancel={() => handleCancelOrder(selectedOrder)}
                    onAdvance={() => handleAdvanceOrder(selectedOrder)}
                />
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="row g-3 mb-3">
                            <div className="col-12 col-md-6 col-lg-3">
                                <label className="form-label" htmlFor="order-status">Trạng thái</label>
                                <select id="order-status" className="form-select" value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}>
                                    <option value="">Tất cả trạng thái</option>
                                    {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                            <div className="col-6 col-lg-3">
                                <label className="form-label" htmlFor="order-from-date">Từ ngày</label>
                                <input id="order-from-date" className="form-control" type="date" value={fromDate}
                                    max={toDate || undefined} onChange={(event) => setFromDate(event.target.value)} />
                            </div>
                            <div className="col-6 col-lg-3">
                                <label className="form-label" htmlFor="order-to-date">Đến ngày</label>
                                <input id="order-to-date" className="form-control" type="date" value={toDate}
                                    min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <DataTable
                                data={filteredOrders}
                                options={tableOptions}
                                className="table table-hover align-middle w-100"
                            >
                                <Column data="id" title="Mã đơn" />
                                <Column data="createdAt" title="Ngày đặt"
                                    render={(data, type) => type === 'display' ? formatDate(data) : data} />
                                <Column data={null} title="Sản phẩm"
                                    render={(_data, type, order) => {
                                        const itemCount = order.items.reduce(
                                            (count: number, item: OrderRecord['items'][number]) => count + item.quantity,
                                            0,
                                        );
                                        return type === 'display' ? `${itemCount} sản phẩm` : itemCount;
                                    }} />
                                <Column data={null} title="Trạng thái">
                                    {(_data, type, order) => {
                                        const status = getOrderStatus(order);
                                        return type === 'display'
                                            ? <span className={`badge ${getStatusClass(status)}`}>{status}</span>
                                            : status;
                                    }}
                                </Column>
                                <Column data="total" title="Tổng tiền"
                                    render={(data, type) => type === 'display' ? formatPrice(data) : data} />
                                <Column data={null} title="Thao tác">
                                    {(_data, type, order) => {
                                        if (type !== 'display') return null;
                                        const status = getOrderStatus(order);
                                        return (
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button type="button" className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setSelectedOrderId(order.id)}>Chi tiết</button>
                                                {status === 'Chờ xác nhận' && (
                                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleCancelOrder(order)}>Hủy đơn</button>
                                                )}
                                            </div>
                                        );
                                    }}
                                </Column>
                            </DataTable>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function OrderDetails({
    order,
    isDemoMode,
    onBack,
    onCancel,
    onAdvance,
}: {
    order: OrderRecord;
    isDemoMode: boolean;
    onBack: () => void;
    onCancel: () => void;
    onAdvance: () => void;
}) {
    const status = getOrderStatus(order);
    const currentStep = ACTIVE_STATUSES.indexOf(status);

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-3">
                <div>
                    <h4 className="fw-bold mb-1">Chi tiết đơn hàng</h4>
                    <span className="text-muted">{order.id} · {formatDate(order.createdAt)}</span>
                </div>
                <span className={`badge ${getStatusClass(status)} px-3 py-2`}>{status}</span>
            </div>
            <div className="card-body">
                <div className="row g-4">
                    <div className="col-12 col-lg-7">
                        <h5 className="fw-bold">Sản phẩm</h5>
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead className="table-light">
                                    <tr><th>Sản phẩm</th><th className="text-center">SL</th><th className="text-end">Thành tiền</th></tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item, index) => (
                                        <tr key={`${item.id}-${index}`}>
                                            <td>{item.name}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end text-nowrap">{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="d-flex justify-content-between"><span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
                        <div className="d-flex justify-content-between"><span>Giảm giá</span><span>-{formatPrice(order.discount)}</span></div>
                        <div className="d-flex justify-content-between"><span>Phí vận chuyển</span><span>{formatPrice(order.shipping)}</span></div>
                        <hr />
                        <div className="d-flex justify-content-between fs-5 fw-bold">
                            <span>Tổng thanh toán</span><span className="text-danger">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                    <div className="col-12 col-lg-5">
                        <h5 className="fw-bold">Người nhận</h5>
                        <p className="mb-1">{order.recipient.name}</p>
                        <p className="mb-1">{order.recipient.phone}</p>
                        <p className="mb-1">{order.recipient.email}</p>
                        <p className="text-break">{order.recipient.address}</p>
                        <p className="mb-1"><strong>Vận chuyển:</strong> {order.deliveryMethod === 'express' ? 'Nhanh' : 'Tiêu chuẩn'}</p>
                        <p><strong>Thanh toán:</strong> {order.paymentMethod.toUpperCase()}</p>

                        <h5 className="fw-bold mt-4">Tiến trình đơn hàng</h5>
                        {status === 'Đã hủy' ? (
                            <div className="alert alert-secondary mb-0" role="status">Đơn hàng đã được hủy và tồn kho đã hoàn lại.</div>
                        ) : (
                            <ol className="list-unstyled mb-0">
                                {ACTIVE_STATUSES.map((step, index) => {
                                    const completed = index <= currentStep;
                                    return (
                                        <li key={step} className="d-flex gap-3 pb-3">
                                            <span className={`rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0 ${completed ? 'bg-primary text-white' : 'bg-light text-muted border'}`}
                                                style={{ width: 28, height: 28 }} aria-hidden="true">
                                                {completed ? <i className="fa-solid fa-check small"></i> : index + 1}
                                            </span>
                                            <span className={completed ? 'fw-semibold text-dark' : 'text-muted'}>{step}</span>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left me-2" aria-hidden="true"></i>Quay lại lịch sử
                    </button>
                    {status === 'Chờ xác nhận' && (
                        <button type="button" className="btn btn-outline-danger" onClick={onCancel}>Hủy đơn hàng</button>
                    )}
                    {isDemoMode && status !== 'Giao hàng thành công' && status !== 'Đã hủy' && (
                        <button type="button" className="btn btn-warning" onClick={onAdvance}>
                            <i className="fa-solid fa-forward-step me-2" aria-hidden="true"></i>Đẩy nhanh trạng thái
                        </button>
                    )}
                </div>
                {isDemoMode && (
                    <small className="text-muted d-block mt-2">Chế độ demo đang bật (?demo=1).</small>
                )}
            </div>
        </div>
    );
}
