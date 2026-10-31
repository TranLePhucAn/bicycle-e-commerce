import '../../styles/layout.css';

export default function Hero() {
    return (
        <section className="hero-section">
            <div className="hero-container">

                <div className="hero-content">
                    <h1 className="hero-title">
                        Chinh Phục Mọi Nẻo Đường Cùng <span>Bicycle Store</span>
                    </h1>
                    <p className="hero-description">
                        Khám phá các dòng xe đạp địa hình, xe đạp đua và xe đạp thể thao cao cấp chính hãng.
                        Thiết kế tối ưu, độ bền vượt trội mang lại trải nghiệm tuyệt vời cho mọi hành trình của bạn.
                    </p>
                    <div className="hero-actions">
                        <a href="#products" className="btn-primary">
                            Khám Phá Ngay
                        </a>
                        <a href="#about" className="btn-outline">
                            Tìm Hiểu Thêm
                        </a>
                    </div>
                </div>

                <div className="hero-image-wrapper">
                    <img
                        src="https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80"
                        alt="Bicycle Showcase"
                        className="hero-image"
                    />
                </div>
            </div>
        </section>
    );
}