import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

interface PageProps {
    onGoHome: () => void;
}

export default function AboutPage({ onGoHome }: PageProps) {
    const [activeSection, setActiveSection] = useState<'about' | 'policy' | 'faq' | 'contact'>('about');

    return (
        <div className="container py-3">
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb small mb-0">
                    <li className="breadcrumb-item">
                        <a
                            href="#"
                            className="text-decoration-none text-secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                onGoHome();
                            }}
                        >
                            Trang chủ
                        </a>
                    </li>
                    <li className="breadcrumb-item active text-dark fw-semibold">Về chúng tôi</li>
                </ol>
            </nav>

            <div className="row g-4">
                <div className="col-12 col-md-3">
                    <div className="bg-white border rounded-2 overflow-hidden">
                        <div
                            className="px-3 py-2 text-white fw-bold small text-uppercase"
                            style={{ backgroundColor: '#1e293b' }}
                        >
                            Danh mục thông tin
                        </div>
                        <div className="list-group list-group-flush">
                            <button
                                type="button"
                                onClick={() => setActiveSection('about')}
                                className={`list-group-item list-group-item-action py-2 px-3 small fw-semibold border-0 border-bottom ${
                                    activeSection === 'about' ? 'bg-light text-primary' : 'text-dark'
                                }`}
                            >
                                Giới thiệu BIKESHOP
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSection('policy')}
                                className={`list-group-item list-group-item-action py-2 px-3 small fw-semibold border-0 border-bottom ${
                                    activeSection === 'policy' ? 'bg-light text-primary' : 'text-dark'
                                }`}
                            >
                                Chính sách đổi trả
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSection('faq')}
                                className={`list-group-item list-group-item-action py-2 px-3 small fw-semibold border-0 border-bottom ${
                                    activeSection === 'faq' ? 'bg-light text-primary' : 'text-dark'
                                }`}
                            >
                                Câu hỏi thường gặp (FAQ)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSection('contact')}
                                className={`list-group-item list-group-item-action py-2 px-3 small fw-semibold border-0 ${
                                    activeSection === 'contact' ? 'bg-light text-primary' : 'text-dark'
                                }`}
                            >
                                Liên hệ & Showroom
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-9">
                    <div className="bg-white border rounded-2 p-4">
                        {activeSection === 'about' && <AboutContent />}
                        {activeSection === 'policy' && <ReturnPolicyContent />}
                        {activeSection === 'faq' && <FAQContent />}
                        {activeSection === 'contact' && <ContactContent />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AboutContent() {
    return (
        <div>
            <h4 className="fw-bold text-dark pb-2 mb-3 border-bottom">
                Giới thiệu hệ thống xe đạp BIKESHOP
            </h4>
            <p className="text-secondary lh-base">
                <strong>BIKESHOP</strong> là cửa hàng chuyên cung cấp các dòng xe đạp thể thao, xe địa hình (MTB), xe đạp đua (Road), xe đường phố (Touring) và xe đạp điện trợ lực chính hãng.
            </p>
            <p className="text-secondary lh-base">
                Tất cả sản phẩm tại cửa hàng đều được nhập nguyên thùng từ các thương hiệu lớn như Giant, Trek, Merida, Specialized, Cannondale, Twitter... có đầy đủ tem kiểm định và phiếu bảo hành chính hãng.
            </p>

            <h6 className="fw-bold text-dark mt-4 mb-2">Cam kết bán hàng:</h6>
            <ul className="text-secondary lh-lg mb-0">
                <li><strong>Hàng chính hãng 100%:</strong> Hoàn tiền gấp đôi nếu phát hiện hàng giả, hàng nhái.</li>
                <li><strong>Lắp ráp & cân chỉnh miễn phí:</strong> Đội ngũ kỹ thuật kiểm tra phanh, bộ đề trước khi giao xe.</li>
                <li><strong>Bảo hành khung sườn 5 năm:</strong> Hỗ trợ bảo dưỡng, tra dầu và căn chỉnh định kỳ tại cửa hàng.</li>
                <li><strong>Giao hàng toàn quốc:</strong> Đóng gói thùng carton chuyên dụng, kiểm tra hàng trước khi thanh toán.</li>
            </ul>
        </div>
    );
}

function ReturnPolicyContent() {
    return (
        <div>
            <h4 className="fw-bold text-dark pb-2 mb-3 border-bottom">
                Chính sách đổi trả & hoàn tiền
            </h4>

            <h6 className="fw-bold text-dark mt-3">1. Thời gian áp dụng đổi trả</h6>
            <p className="text-secondary">
                Khách hàng được đổi sản phẩm mới hoặc hoàn tiền trong vòng <strong>07 ngày</strong> kể từ ngày nhận hàng nếu phát sinh lỗi kỹ thuật từ nhà sản xuất.
            </p>

            <h6 className="fw-bold text-dark mt-3">2. Điều kiện chấp nhận đổi trả</h6>
            <ul className="text-secondary lh-lg">
                <li>Xe còn nguyên vẹn khung sườn, chưa trầy xước, va đập hoặc tự ý tháo lắp sửa chữa bên ngoài.</li>
                <li>Lốp xe chưa có dấu hiệu lăn bánh trên đường nhựa hoặc địa hình ngoài trời.</li>
                <li>Còn đầy đủ hóa đơn mua hàng, phiếu bảo hành và phụ kiện đi kèm.</li>
            </ul>

            <h6 className="fw-bold text-dark mt-3">3. Chi phí vận chuyển</h6>
            <p className="text-secondary mb-0">
                BIKESHOP chịu <strong>100% chi phí vận chuyển</strong> 2 chiều đối với các đơn hàng đổi trả do lỗi từ nhà sản xuất hoặc giao sai mẫu, sai kích thước khung.
            </p>
        </div>
    );
}

function FAQContent() {
    const faqs = [
        {
            q: 'Làm sao để chọn đúng kích thước khung (Size S, M, L, XL) phù hợp chiều cao?',
            a: 'Size S phù hợp chiều cao 1m55 - 1m65; Size M phù hợp 1m65 - 1m75; Size L phù hợp 1m75 - 1m85; Size XL phù hợp trên 1m85.'
        },
        {
            q: 'Xe đạp mua online có được lắp ráp sẵn không?',
            a: 'Tất cả xe đạp giao đi tỉnh đều được kỹ thuật viên căn chỉnh bộ đề, phanh chuẩn xác và lắp sẵn 95% (chỉ cần gắn thêm bánh trước và bàn đạp).'
        },
        {
            q: 'Tôi có thể thanh toán khi nhận hàng (COD) không?',
            a: 'Có. BIKESHOP hỗ trợ thanh toán COD toàn quốc, chuyển khoản ngân hàng hoặc thanh toán trả góp 0% qua thẻ tín dụng.'
        },
        {
            q: 'Chế độ bảo hành xe đạp tại BIKESHOP như thế nào?',
            a: 'Khung xe được bảo hành chính hãng 5 năm; bộ truyền động, phuộc và phanh được bảo hành 12 tháng.'
        }
    ];

    return (
        <div>
            <h4 className="fw-bold text-dark pb-2 border-bottom">
                Câu hỏi thường gặp (FAQ)
            </h4>
            <div className="divide-y">
                {faqs.map((item, idx) => (
                    <div key={idx} className="py-3 border-bottom">
                        <div className="fw-bold text-dark mb-1">
                            {idx + 1}. {item.q}
                        </div>
                        <p className="text-secondary small mb-0">{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ContactContent() {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ và tên.';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập địa chỉ email.';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Địa chỉ email không hợp lệ.';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại.';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Vui lòng nhập nội dung cần liên hệ.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            showToast('Gửi thông tin liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
            setFormData({ fullName: '', email: '', phone: '', subject: '', message: '' });
            setErrors({});
        } else {
            showToast('Vui lòng kiểm tra lại thông tin nhập trên form!', 'danger');
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <div>
            <h4 className="fw-bold text-dark pb-2 mb-3 border-bottom">
                Liên hệ với BIKESHOP
            </h4>

            <div className="bg-light border rounded-2 p-3 mb-4 small text-secondary">
                <div className="mb-1">
                    <strong className="text-dark">Địa chỉ showroom:</strong> Trường Đại học Nông Lâm TP.HCM
                </div>
                <div className="mb-1">
                    <strong className="text-dark">Hotline tư vấn:</strong> 0123 456 789
                </div>
                <div>
                    <strong className="text-dark">Email:</strong> support@bikeshop.com
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold small">
                            Họ và tên <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control form-control-sm ${errors.fullName ? 'is-invalid' : ''}`}
                            placeholder="Nhập họ tên của bạn"
                            value={formData.fullName}
                            onChange={(e) => handleChange('fullName', e.target.value)}
                        />
                        {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold small">
                            Số điện thoại <span className="text-danger">*</span>
                        </label>
                        <input
                            type="tel"
                            className={`form-control form-control-sm ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="Ví dụ: 0912345678"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold small">
                            Email <span className="text-danger">*</span>
                        </label>
                        <input
                            type="email"
                            className={`form-control form-control-sm ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="example@gmail.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold small">Chủ đề quan tâm</label>
                        <select
                            className="form-select form-select-sm"
                            value={formData.subject}
                            onChange={(e) => handleChange('subject', e.target.value)}
                        >
                            <option value="">-- Chọn chủ đề --</option>
                            <option value="Tư vấn chọn size xe">Tư vấn chọn size xe</option>
                            <option value="Bảo hành & Sửa chữa">Bảo hành & Sửa chữa</option>
                            <option value="Hỗ trợ đơn hàng">Hỗ trợ đơn hàng</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold small">
                            Nội dung liên hệ <span className="text-danger">*</span>
                        </label>
                        <textarea
                            rows={4}
                            className={`form-control form-control-sm ${errors.message ? 'is-invalid' : ''}`}
                            placeholder="Nhập nội dung câu hỏi hoặc yêu cầu hỗ trợ..."
                            value={formData.message}
                            onChange={(e) => handleChange('message', e.target.value)}
                        ></textarea>
                        {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                    </div>

                    <div className="col-12">
                        <button
                            type="submit"
                            className="btn btn-sm text-white px-4 py-2 fw-semibold"
                            style={{ backgroundColor: '#1e293b' }}
                        >
                            Gửi liên hệ
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}