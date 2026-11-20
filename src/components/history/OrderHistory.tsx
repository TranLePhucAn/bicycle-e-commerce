import { useEffect, useMemo, useState } from 'react';
import DataTable, { Column } from 'datatables.net-react';
import DataTablesBootstrap from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.min.css';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../services/apiClient';
import {
    getOrderStatus,
    type OrderRecord,
    type OrderStatus,
} from '../../services/checkoutService';
import {
    createReturnRequest,
    getReturnRequest,
    getProductReview,
    saveProductReview,
    addNotification,
    type ReturnRequest,
} from '../../services/customerService';

DataTable.use(DataTablesBootstrap);

interface OrderHistoryProps {
    onContinueShopping: () => void;
    onViewCart: () => void;
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

function canCancelOrderStatus(status: OrderStatus): boolean {
    return status !== 'Giao hàng thành công' && status !== 'Đã hủy';
}

export default function OrderHistory({ onContinueShopping }: OrderHistoryProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { cartItems, addToCart } = useCart();
    const [orders, setOrders] = useState<OrderRecord[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [pendingCancelOrder, setPendingCancelOrder] = useState<OrderRecord | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [repurchasingOrderId, setRepurchasingOrderId] = useState<string | null>(null);
    const isDemoMode = new URLSearchParams(window.location.search).get('demo') === '1';

    useEffect(() => {
        if (!user) return;
        let isActive = true;
        apiRequest<{ orders: OrderRecord[] }>('/api/orders/me')
            .then(({ orders: serverOrders }) => {
                if (isActive) setOrders(serverOrders);
            })
            .catch((error: Error) => {
                if (isActive) showToast(error.message || 'Không thể tải lịch sử đơn hàng.', 'danger');
            });
        return () => { isActive = false; };
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

    const requestCancelOrder = (order: OrderRecord) => {
        setPendingCancelOrder(order);
    };

    const confirmCancelOrder = async () => {
        if (!user || !pendingCancelOrder) return;
        const order = pendingCancelOrder;
        try {
            const { order: cancelled } = await apiRequest<{ order: OrderRecord }>(
                `/api/orders/${encodeURIComponent(order.id)}/cancel`,
                { method: 'POST' },
            );
            setOrders((current) => current.map((item) => item.id === cancelled.id ? cancelled : item));
            addNotification(user.id, 'Đơn hàng đã hủy', `Đơn ${cancelled.id} đã được hủy và sản phẩm đã hoàn lại.`, 'order');
            showToast('Đã hủy đơn hàng và hoàn tồn kho.', 'success');
            setPendingCancelOrder(null);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể hủy đơn hàng.', 'danger');
            setPendingCancelOrder(null);
        }
    };

    const handleAdvanceOrder = async (order: OrderRecord) => {
        if (!user) return;

        try {
            const { order: advanced } = await apiRequest<{ order: OrderRecord }>(
                `/api/orders/${encodeURIComponent(order.id)}/advance`,
                { method: 'POST' },
            );
            setOrders((current) => current.map((item) => item.id === advanced.id ? advanced : item));
            addNotification(user.id, 'Cập nhật đơn hàng', `Đơn ${advanced.id} đã chuyển sang ${getOrderStatus(advanced)}.`, 'order');
            showToast(`Đã đẩy trạng thái đơn thành ${getOrderStatus(advanced)}.`, 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể đẩy nhanh trạng thái.', 'danger');
        }
    };

    const handleRepurchase = async (order: OrderRecord) => {
        if (repurchasingOrderId) return;
        setRepurchasingOrderId(order.id);
        try {
            const result = await apiRequest<{ bikes: { id: string; name: string; price: number; image: string; stock: number }[] }>('/api/bikes');
            const unavailable: string[] = [];
            const orderItems = new Map<string, { item: OrderRecord['items'][number]; quantity: number }>();
            for (const item of order.items) {
                const current = orderItems.get(item.id);
                orderItems.set(item.id, { item, quantity: (current?.quantity || 0) + item.quantity });
            }
            const availableItems = Array.from(orderItems.values()).flatMap(({ item, quantity }) => {
                const bike = result.bikes.find((candidate) => candidate.id === item.id);
                const inCart = cartItems.find((cartItem) => cartItem.id === item.id)?.quantity || 0;
                if (!bike || quantity + inCart > bike.stock) {
                    unavailable.push(item.name);
                    return [];
                }
                return [{ bike, quantity }];
            });

            if (availableItems.length === 0) {
                showToast('Sản phẩm trong đơn cũ hiện không đủ tồn kho để mua lại.', 'warning');
                return;
            }

            for (const item of availableItems) {
                const added = await addToCart(item.bike, item.quantity);
                if (!added) throw new Error(`Không thể thêm ${item.bike.name} vào giỏ.`);
            }
            showToast(unavailable.length
                ? `Đã thêm sản phẩm còn hàng. Bỏ qua: ${unavailable.join(', ')}.`
                : 'Đã thêm các sản phẩm của đơn hàng vào giỏ.', unavailable.length ? 'warning' : 'success');
            onViewCart();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể kiểm tra tồn kho để mua lại.', 'danger');
        } finally {
            setRepurchasingOrderId(null);
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
                    onCancel={() => requestCancelOrder(selectedOrder)}
                    onAdvance={() => handleAdvanceOrder(selectedOrder)}
                    onRepurchase={() => handleRepurchase(selectedOrder)}
                    isRepurchasing={repurchasingOrderId === selectedOrder.id}
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
                                                {canCancelOrderStatus(status) && (
                                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                                        onClick={() => requestCancelOrder(order)}>Hủy đơn</button>
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
            {pendingCancelOrder && (
                <div
                    className="modal fade show d-block"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cancel-order-title"
                    style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)' }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setPendingCancelOrder(null);
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div className="modal-body text-center p-4 p-md-5">
                                <div
                                    className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-3"
                                    style={{ width: '72px', height: '72px' }}
                                >
                                    <i className="fa-solid fa-triangle-exclamation fs-2" aria-hidden="true"></i>
                                </div>
                                <h4 id="cancel-order-title" className="fw-bold mb-2">Xác nhận hủy đơn</h4>
                                <p className="text-muted mb-1">
                                    Bạn có chắc muốn hủy đơn <strong className="text-dark">{pendingCancelOrder.id}</strong>?
                                </p>
                                <p className="small text-muted mb-0">
                                    Các sản phẩm trong đơn sẽ được hoàn lại vào tồn kho.
                                </p>
                            </div>
                            <div className="modal-footer justify-content-center border-0 pt-0 pb-4 px-4 gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light border px-4"
                                    onClick={() => setPendingCancelOrder(null)}
                                >
                                    Không, giữ đơn
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger px-4"
                                    onClick={confirmCancelOrder}
                                >
                                    <i className="fa-solid fa-xmark me-2" aria-hidden="true"></i>
                                    Xác nhận hủy
                                </button>
                            </div>
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
    onRepurchase,
    isRepurchasing,
}: {
    order: OrderRecord;
    isDemoMode: boolean;
    onBack: () => void;
    onCancel: () => void;
    onAdvance: () => void;
    onRepurchase: () => void;
    isRepurchasing: boolean;
}) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const status = getOrderStatus(order);
    const currentStep = ACTIVE_STATUSES.indexOf(status);
    const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>(() => {
        if (!user) return {};
        return Object.fromEntries(order.items.map((item) => {
            const review = getProductReview(order.id, item.id, user.id);
            return [item.id, { rating: review?.rating ?? 0, comment: review?.comment ?? '' }];
        }));
    });
    const [returnRequest, setReturnRequest] = useState<ReturnRequest | null>(() =>
        user ? getReturnRequest(order.id, user.id) : null
    );
    const [returnProductIds, setReturnProductIds] = useState<string[]>([]);
    const [returnReason, setReturnReason] = useState('');
    const [returnDetails, setReturnDetails] = useState('');

    const handleSaveReview = (productId: string) => {
        if (!user) return;
        const draft = reviewDrafts[productId];
        try {
            saveProductReview({
                orderId: order.id,
                productId,
                userId: user.id,
                rating: draft?.rating ?? 0,
                comment: draft?.comment ?? '',
            });
            showToast('Đã lưu đánh giá sản phẩm.', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể lưu đánh giá.', 'danger');
        }
    };

    const handleCreateReturn = () => {
        if (!user) return;
        const selectedItems = order.items.filter((item) => returnProductIds.includes(item.id));
        try {
            const request = createReturnRequest({
                orderId: order.id,
                userId: user.id,
                productIds: selectedItems.map((item) => item.id),
                productNames: selectedItems.map((item) => item.name),
                reason: returnReason,
                details: returnDetails,
            });
            setReturnRequest(request);
            showToast('Đã gửi yêu cầu đổi trả.', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể gửi yêu cầu đổi trả.', 'danger');
        }
    };

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

                {status === 'Giao hàng thành công' && (
                    <div className="mt-4">
                        <h5 className="fw-bold">Đánh giá sản phẩm</h5>
                        <div className="row g-3">
                            {order.items.map((item, index) => {
                                const draft = reviewDrafts[item.id] ?? { rating: 0, comment: '' };
                                return (
                                    <div className="col-12 col-lg-6" key={`${item.id}-${index}`}>
                                        <div className="border rounded p-3 h-100">
                                            <strong>{item.name}</strong>
                                            <div className="d-flex align-items-center gap-1 my-2" aria-label="Chọn số sao">
                                                {[1, 2, 3, 4, 5].map((rating) => (
                                                    <button
                                                        type="button"
                                                        key={rating}
                                                        className="btn btn-link p-0 border-0 text-decoration-none"
                                                        onClick={() => setReviewDrafts((current) => ({
                                                            ...current,
                                                            [item.id]: { ...draft, rating },
                                                        }))}
                                                        aria-label={`${rating} sao`}
                                                    >
                                                        <i className={`${rating <= draft.rating ? 'fa-solid' : 'fa-regular'} fa-star text-warning fs-4`}></i>
                                                    </button>
                                                ))}
                                                {draft.rating > 0 && <span className="small text-muted ms-1">{draft.rating}/5</span>}
                                            </div>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                maxLength={500}
                                                value={draft.comment}
                                                onChange={(event) => setReviewDrafts((current) => ({
                                                    ...current,
                                                    [item.id]: { ...draft, comment: event.target.value },
                                                }))}
                                                placeholder="Chia sẻ cảm nhận của bạn..."
                                            />
                                            <button type="button" className="btn btn-outline-primary btn-sm mt-2"
                                                onClick={() => handleSaveReview(item.id)}>
                                                Lưu đánh giá
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <h5 className="fw-bold mt-4">Yêu cầu đổi trả</h5>
                        {returnRequest ? (
                            <div className="alert alert-info mb-0">
                                <strong>{returnRequest.id}</strong>
                                {' · '}
                                {returnRequest.productNames?.length
                                    ? returnRequest.productNames.join(', ')
                                    : 'Các sản phẩm trong đơn'}
                                {' · '}
                                {returnRequest.reason}
                                {' · '}
                                <span className="badge bg-warning text-dark">{returnRequest.status}</span>
                            </div>
                        ) : (
                            <div className="border rounded p-3">
                                <h6 className="fw-semibold mb-2">Sản phẩm cần đổi trả</h6>
                                <div className="border rounded p-2 mb-3">
                                    {order.items.map((item, index) => (
                                        <div className="form-check py-1" key={`${item.id}-${index}`}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`return-product-${item.id}-${index}`}
                                                checked={returnProductIds.includes(item.id)}
                                                onChange={(event) => {
                                                    setReturnProductIds((current) =>
                                                        event.target.checked
                                                            ? [...current, item.id]
                                                            : current.filter((productId) => productId !== item.id)
                                                    );
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor={`return-product-${item.id}-${index}`}>
                                                {item.name}
                                                <span className="text-muted ms-2">x{item.quantity}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label" htmlFor="return-reason">Lý do</label>
                                        <select id="return-reason" className="form-select" value={returnReason}
                                            onChange={(event) => setReturnReason(event.target.value)}>
                                            <option value="">Chọn lý do</option>
                                            <option value="Sai sản phẩm">Sai sản phẩm</option>
                                            <option value="Sản phẩm lỗi">Sản phẩm lỗi</option>
                                            <option value="Không còn nhu cầu">Không còn nhu cầu</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-8">
                                        <label className="form-label" htmlFor="return-details">Chi tiết</label>
                                        <textarea id="return-details" className="form-control" rows={2} maxLength={500}
                                            value={returnDetails} onChange={(event) => setReturnDetails(event.target.value)}
                                            placeholder="Mô tả tình trạng sản phẩm..." />
                                    </div>
                                </div>
                                <button type="button" className="btn btn-outline-warning mt-3" onClick={handleCreateReturn}>
                                    Gửi yêu cầu đổi trả
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-4">
                    <button type="button" className="btn btn-outline-secondary" onClick={onBack}>
                        <i className="fa-solid fa-arrow-left me-2" aria-hidden="true"></i>Quay lại lịch sử
                    </button>
                    {canCancelOrderStatus(status) && (
                        <button type="button" className="btn btn-outline-danger" onClick={onCancel}>Hủy đơn hàng</button>
                    )}
                    <button type="button" className="btn btn-primary" onClick={onRepurchase} disabled={isRepurchasing}>
                        <i className={`fa-solid ${isRepurchasing ? 'fa-spinner fa-spin' : 'fa-cart-plus'} me-2`} aria-hidden="true"></i>
                        {isRepurchasing ? 'Đang thêm vào giỏ...' : 'Mua lại'}
                    </button>
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
