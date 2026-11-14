import { useMemo, useRef, useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getDefaultAddress,
    getUserAddresses,
    formatFullAddress,
    type AddressItem,
} from '../../services/addressService';
import {
    getCouponDiscount,
    getShippingFee,
    isCouponCodeValid,
    normalizeCouponCode,
} from '../../services/couponService';
import {
    createOrder,
    type CheckoutItem,
    type DeliveryMethod,
    type OrderRecord,
    type PaymentMethod,
    type RecipientDetails,
} from '../../services/checkoutService';

interface CheckoutProps {
    items: CheckoutItem[];
    onCancel: () => void;
    onOrderCreated: (order: OrderRecord) => void;
}

const emptyRecipient: RecipientDetails = { name: '', phone: '', email: '', address: '' };
const formatPrice = (amount: number) => `${amount.toLocaleString('vi-VN')} đ`;

export default function Checkout({ items, onCancel, onOrderCreated }: CheckoutProps) {
    const { user } = useAuth();
    const savedAddresses = useMemo(() => user ? getUserAddresses(user.id) : [], [user]);
    const defaultAddress = useMemo(() => user ? getDefaultAddress(user.id) : null, [user]);

    const [recipient, setRecipient] = useState<RecipientDetails>(() => {
        const addr = user ? getDefaultAddress(user.id) : null;
        return {
            name: addr?.fullName || user?.name || '',
            phone: addr?.phone || user?.phone || '',
            email: user?.email || '',
            address: addr ? formatFullAddress(addr) : '',
        };
    });

    useEffect(() => {
        if (user && defaultAddress) {
            setRecipient((prev) => ({
                name: prev.name || defaultAddress.fullName || user.name || '',
                phone: prev.phone || defaultAddress.phone || user.phone || '',
                email: prev.email || user.email || '',
                address: prev.address || formatFullAddress(defaultAddress),
            }));
        }
    }, [user, defaultAddress]);

    const handleSelectSavedAddress = (addrId: string) => {
        const found = savedAddresses.find((a) => a.id === addrId);
        if (found) {
            setRecipient((prev) => ({
                ...prev,
                name: found.fullName,
                phone: found.phone,
                address: formatFullAddress(found),
            }));
        }
    };
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('standard');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState('');
    const [couponMessage, setCouponMessage] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const submittingRef = useRef(false);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items],
    );
    const discount = getCouponDiscount(appliedCoupon, subtotal);
    const shipping = getShippingFee(deliveryMethod, appliedCoupon);
    const total = Math.max(0, subtotal - discount + shipping);

    const applyCoupon = () => {
        const code = normalizeCouponCode(couponInput);
        if (!isCouponCodeValid(code)) {
            setAppliedCoupon('');
            setCouponMessage('');
            setError('Mã không hợp lệ. Hãy thử BIKE10 hoặc FREESHIP.');
            return;
        }
        setAppliedCoupon(code);
        setCouponMessage(code === 'BIKE10' ? 'Đã giảm 10% tiền sản phẩm.' : 'Đã miễn phí vận chuyển.');
        setError('');
    };

    const submitRecipient = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (items.length === 0) {
            setError('Giỏ hàng đang trống.');
            return;
        }
        const normalizedRecipient = {
            name: recipient.name.trim(),
            phone: recipient.phone.trim(),
            email: recipient.email.trim(),
            address: recipient.address.trim(),
        };
        if (Object.values(normalizedRecipient).some((value) => !value)) {
            setError('Vui lòng nhập đầy đủ thông tin người nhận.');
            return;
        }
        setRecipient(normalizedRecipient);
        setError('');
        setConfirming(true);
    };

    const confirmOrder = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);

        try {
            const order = await createOrder({
                items,
                recipient,
                couponCode: appliedCoupon,
                deliveryMethod,
                paymentMethod,
            });
            onOrderCreated(order);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : 'Không thể tạo đơn hàng.');
            setConfirming(false);
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    return (
        <section className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h3 className="fw-bold m-0">Thanh toán</h3>
                    <small className="text-muted">Thông tin nhận hàng và xác nhận đơn</small>
                </div>
                <button type="button" className="btn btn-outline-dark btn-sm" onClick={onCancel}>
                    Quay lại giỏ hàng
                </button>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            {!confirming ? (
                <form onSubmit={submitRecipient}>
                    <div className="row g-4">
                        <div className="col-12 col-lg-7">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-dark text-white fw-semibold">Người nhận</div>
                                <div className="card-body">
                                    {savedAddresses.length > 0 && (
                                        <div className="mb-3 p-2 bg-light rounded border">
                                            <label className="form-label small fw-semibold text-primary mb-1">
                                                <i className="fa-solid fa-address-book me-1"></i> Chọn từ sổ địa chỉ của bạn:
                                            </label>
                                            <select
                                                className="form-select form-select-sm"
                                                onChange={(e) => e.target.value && handleSelectSavedAddress(e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="">-- Bấm để chọn địa chỉ nhận hàng --</option>
                                                {savedAddresses.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.fullName} - {a.phone} ({formatFullAddress(a)}) {a.isDefault ? '★ Mặc định' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <label className="form-label" htmlFor="checkout-name">Họ tên</label>
                                    <input id="checkout-name" className="form-control mb-3" required maxLength={100}
                                        value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })} />

                                    <label className="form-label" htmlFor="checkout-phone">Số điện thoại</label>
                                    <input id="checkout-phone" className="form-control mb-3" type="tel" required
                                        pattern="[0-9+(). \-]{9,16}" title="Nhập số điện thoại hợp lệ."
                                        value={recipient.phone} onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })} />

                                    <label className="form-label" htmlFor="checkout-email">Email</label>
                                    <input id="checkout-email" className="form-control mb-3" type="email" required
                                        value={recipient.email} onChange={(e) => setRecipient({ ...recipient, email: e.target.value })} />

                                    <label className="form-label" htmlFor="checkout-address">Địa chỉ nhận hàng</label>
                                    <textarea id="checkout-address" className="form-control" rows={2} required maxLength={300}
                                        value={recipient.address} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} />
                                </div>
                            </div>

                            <div className="card border-0 shadow-sm mt-4">
                                <div className="card-header bg-dark text-white fw-semibold">Vận chuyển và thanh toán</div>
                                <div className="card-body">
                                    <p className="fw-semibold mb-2">Vận chuyển</p>
                                    <div className="form-check">
                                        <input className="form-check-input" type="radio" name="delivery" id="standard"
                                            checked={deliveryMethod === 'standard'} onChange={() => setDeliveryMethod('standard')} />
                                        <label className="form-check-label" htmlFor="standard">Tiêu chuẩn (150.000 đ)</label>
                                    </div>
                                    <div className="form-check mb-3">
                                        <input className="form-check-input" type="radio" name="delivery" id="express"
                                            checked={deliveryMethod === 'express'} onChange={() => setDeliveryMethod('express')} />
                                        <label className="form-check-label" htmlFor="express">Nhanh (300.000 đ)</label>
                                    </div>
                                    <p className="fw-semibold mb-2">Thanh toán</p>
                                    {([
                                        ['cod', 'Thanh toán khi nhận hàng (COD)'],
                                        ['qr', 'QR tĩnh (mô phỏng)'],
                                        ['card', 'Thẻ ngân hàng (mô phỏng)'],
                                    ] as const).map(([method, label]) => (
                                        <div className="form-check" key={method}>
                                            <input className="form-check-input" type="radio" name="payment" id={`payment-${method}`}
                                                checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                                            <label className="form-check-label" htmlFor={`payment-${method}`}>{label}</label>
                                        </div>
                                    ))}
                                    {paymentMethod !== 'cod' && (
                                        <div className="alert alert-info mt-3 mb-0">
                                            Phương thức này chỉ mô phỏng, không phát sinh giao dịch thật.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-5">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-dark text-white fw-semibold">Đơn hàng</div>
                                <div className="card-body">
                                    {items.map((item) => (
                                        <div className="d-flex justify-content-between gap-3 mb-2" key={item.id}>
                                            <span>{item.name} × {item.quantity}</span>
                                            <span className="text-nowrap">{formatPrice(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                    <hr />
                                    <div className="input-group mb-2">
                                        <input className="form-control" aria-label="Mã giảm giá" placeholder="BIKE10 hoặc FREESHIP"
                                            value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                                        <button className="btn btn-outline-dark" type="button" onClick={applyCoupon}>Áp dụng</button>
                                    </div>
                                    {couponMessage && <small className="text-success d-block mb-3">{couponMessage}</small>}
                                    <div className="d-flex justify-content-between mb-2"><span>Tạm tính</span><strong>{formatPrice(subtotal)}</strong></div>
                                    <div className="d-flex justify-content-between mb-2"><span>Giảm giá</span><strong>-{formatPrice(discount)}</strong></div>
                                    <div className="d-flex justify-content-between mb-2"><span>Phí ship</span><strong>{formatPrice(shipping)}</strong></div>
                                    <hr />
                                    <div className="d-flex justify-content-between fs-5 mb-3">
                                        <strong>Tổng tiền</strong><strong className="text-danger">{formatPrice(total)}</strong>
                                    </div>
                                    <button className="btn btn-primary w-100" type="submit">Xem xác nhận đơn</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-dark text-white fw-semibold">Xác nhận đơn hàng</div>
                    <div className="card-body">
                        <p className="mb-1"><strong>Người nhận:</strong> {recipient.name}</p>
                        <p className="mb-1"><strong>Điện thoại:</strong> {recipient.phone}</p>
                        <p className="mb-1"><strong>Email:</strong> {recipient.email}</p>
                        <p><strong>Địa chỉ:</strong> {recipient.address}</p>
                        <p><strong>Giao hàng:</strong> {deliveryMethod === 'standard' ? 'Tiêu chuẩn' : 'Nhanh'}</p>
                        <p><strong>Thanh toán:</strong> {paymentMethod.toUpperCase()}</p>
                        <p><strong>Tổng thanh toán:</strong> <span className="text-danger fw-bold">{formatPrice(total)}</span></p>
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-outline-secondary" onClick={() => setConfirming(false)}>Chỉnh sửa</button>
                            <button type="button" className="btn btn-primary" onClick={confirmOrder} disabled={submitting}>
                                {submitting ? 'Đang tạo đơn...' : 'Xác nhận đặt hàng'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
