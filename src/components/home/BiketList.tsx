// import bikesData from '../../data/bikes.json';
// import BikeCard from './BikeCard';
// import '../../styles/home.css';
//
// export default function BiketList() {
//     return (
//         <section className="container py-5">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h3 className="fw-bold text-dark m-0 border-start border-4 border-dark ps-3">
//                     DANH SÁCH XE ĐẠP NỔI BẬT
//                 </h3>
//             </div>
//
//             <div className="row g-4">
//                 {bikesData.map((bike) => (<BikeCard key={bike.id} bike={bike} />))}
//             </div>
//         </section>
//     );
// }

import { useState, useMemo } from 'react';
import bikesData from '../../data/bikes.json';
import BikeCard from './BikeCard';
import '../../styles/home.css';

interface BikeListProps {
    selectedCategory?: string | string[];
    searchKeyword?: string;
    onSelectTab?: (category: string) => void;
}

export default function ProductList({ selectedCategory = 'Tất cả', searchKeyword = '', onSelectTab }: BikeListProps) {
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<string>('all');
    const [onlyDiscount, setOnlyDiscount] = useState<boolean>(false); // State lọc khuyến mãi
    const [sortBy, setSortBy] = useState<string>('newest');
    const [brandSearch, setBrandSearch] = useState<string>('');

    const isSearchPage = Boolean(searchKeyword.trim());
    const isHomePage = selectedCategory === 'Tất cả' && !isSearchPage;

    const availableBrands = useMemo(() => {
        const brands = Array.from(new Set(bikesData.map((b: any) => b.brand).filter(Boolean)));
        return brands as string[];
    }, []);

    const filteredBikes = useMemo(() => {
        let result = [...bikesData];

        if (isSearchPage) {
            const kw = searchKeyword.toLowerCase().trim();
            return result.filter((b: any) =>
                b.name?.toLowerCase().includes(kw) ||
                b.brand?.toLowerCase().includes(kw) ||
                b.category?.toLowerCase().includes(kw)
            );
        }

        if (Array.isArray(selectedCategory)) {
            result = result.filter((bike: any) => selectedCategory.includes(bike.category));
        } else if (!isHomePage) {
            result = result.filter((bike: any) => bike.category === selectedCategory);
        }

        if (!isHomePage && selectedBrands.length > 0) {
            result = result.filter((bike: any) => selectedBrands.includes(bike.brand));
        }

        if (!isHomePage && priceRange !== 'all') {
            result = result.filter((bike: any) => {
                const price = bike.price || 0;
                if (priceRange === 'under-500k') return price < 500000;
                if (priceRange === '500k-5m') return price >= 500000 && price <= 5000000;
                if (priceRange === '5m-20m') return price > 5000000 && price <= 20000000;
                if (priceRange === '20m-50m') return price > 20000000 && price <= 50000000;
                if (priceRange === 'over-50m') return price > 50000000;
                return true;
            });
        }

        if (!isHomePage && onlyDiscount) {
            result = result.filter((bike: any) =>
                bike.discount || (bike.originalPrice && bike.originalPrice > bike.price)
            );
        }

        if (!isHomePage) {
            if (sortBy === 'price-asc') {
                result.sort((a: any, b: any) => a.price - b.price);
            } else if (sortBy === 'price-desc') {
                result.sort((a: any, b: any) => b.price - a.price);
            }
        }

        return result;
    }, [selectedCategory, searchKeyword, selectedBrands, onlyDiscount, priceRange, sortBy, isHomePage, isSearchPage]);

    const handleBrandToggle = (brand: string) => {
        setSelectedBrands((prev) =>
            prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
        );
    };

    const getTitle = () => {
        if (Array.isArray(selectedCategory)) return 'XE ĐIỆN & GẤP CHÍNH HÃNG';
        return isHomePage ? 'DANH SÁCH XE ĐẠP NỔI BẬT' : `XE ĐẠP ${selectedCategory.toUpperCase()}`;
    };

    const categoryName = Array.isArray(selectedCategory) ? 'Xe điện & Gấp' : selectedCategory;

    const filteredBrandList = availableBrands.filter((b) =>
        b.toLowerCase().includes(brandSearch.toLowerCase())
    );

    if (isSearchPage) {
        return (
            <section className="container py-3">
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb mb-0">
                        <li className="breadcrumb-item">
                            <a
                                href="#"
                                className="text-decoration-none text-muted"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelectTab?.('Tất cả');
                                }}
                            >
                                Trang chủ
                            </a>
                        </li>
                        <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">
                            Kết quả tìm kiếm
                        </li>
                    </ol>
                </nav>

                <div className="text-center my-4">
                    <h4 className="fw-normal text-dark">
                        Có <b className="fw-bold">{filteredBikes.length}</b> kết quả tìm kiếm phù hợp
                    </h4>
                </div>

                {filteredBikes.length > 0 ? (
                    <div className="row g-4">
                        {filteredBikes.map((bike: any) => (
                            <BikeCard key={bike.id} bike={bike} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white text-center py-5 rounded border text-muted">
                        <i className="fa-solid fa-magnifying-glass fs-1 mb-2 text-secondary"></i>
                        <p className="fs-5 mb-0">Không tìm thấy sản phẩm nào phù hợp với từ khóa "{searchKeyword}".</p>
                    </div>
                )}
            </section>
        );
    }

    if (isHomePage) {
        return (
            <section className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold text-dark m-0 border-start border-4 border-dark ps-3">
                        {getTitle()}
                    </h3>
                </div>

                <div className="row g-4">
                    {filteredBikes.map((bike: any) => (
                        <BikeCard key={bike.id} bike={bike} />
                    ))}
                </div>
            </section>
        );
    }
    return (
        <section className="container py-3">
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                        <a
                            href="#"
                            className="text-decoration-none text-muted"
                            onClick={(e) => {
                                e.preventDefault();
                                onSelectTab?.('Tất cả');
                            }}
                        >
                            Trang chủ
                        </a>
                    </li>
                    <li className="breadcrumb-item active text-success fw-semibold" aria-current="page">
                        {categoryName.toUpperCase()}
                    </li>
                </ol>
            </nav>

            <div className="row g-4">
                <div className="col-12 col-lg-3">
                    <div className="p-3  rounded">
                        <h5 className="fw-bold text-uppercase mb-1">BỘ LỌC</h5>
                        <p className="text-muted small mb-4">Giúp lọc nhanh sản phẩm bạn tìm kiếm</p>

                        <hr/>

                        <div className="mb-4">
                            <h6 className="fw-bold text-dark mb-2">Thương hiệu</h6>
                            <div className="input-group input-group-sm mb-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Tìm Thương hiệu"
                                    value={brandSearch}
                                    onChange={(e) => setBrandSearch(e.target.value)}
                                />
                                <button className="btn btn-success" type="button">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                </button>
                            </div>
                            <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '180px' }}>
                                {filteredBrandList.map((brand) => (
                                    <div key={brand} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`brand-${brand}`}
                                            checked={selectedBrands.includes(brand)}
                                            onChange={() => handleBrandToggle(brand)}
                                        />
                                        <label className="form-check-label text-secondary small" htmlFor={`brand-${brand}`}>
                                            {brand}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr/>

                        <div className="mb-3">
                            <h6 className="fw-bold text-dark mb-2">Giá sản phẩm</h6>
                            <div
                                className="d-flex flex-column gap-2 pe-1 overflow-auto"
                                style={{ maxHeight: '165px' }}
                            >
                                {[
                                    { id: 'all', label: 'Tất cả mức giá' },
                                    { id: 'under-500k', label: 'Dưới 500.000đ' },
                                    { id: '500k-5m', label: '500.000đ - 5.000.000đ' },
                                    { id: '5m-20m', label: '5.000.000đ - 20.000.000đ' },
                                    { id: '20m-50m', label: '20.000.000đ - 50.000.000đ' },
                                    { id: 'over-50m', label: 'Giá trên 50.000.000đ' },
                                ].map((item) => (
                                    <div key={item.id} className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="priceRange"
                                            id={`price-${item.id}`}
                                            checked={priceRange === item.id}
                                            onChange={() => setPriceRange(item.id)}
                                        />
                                        <label className="form-check-label text-secondary small" htmlFor={`price-${item.id}`}>
                                            {item.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr/>

                        <div className="mb-4">
                            <h6 className="fw-bold text-dark mb-2">Khuyến mãi</h6>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="filterDiscount"
                                    checked={onlyDiscount}
                                    onChange={(e) => setOnlyDiscount(e.target.checked)}
                                />
                                <label className="form-check-label small" htmlFor="filterDiscount">
                                    Giảm giá
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-9">
                    <div className="p-3 rounded">
                        <h4 className="fw-bold text-dark text-uppercase mb-3">{getTitle()}</h4>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-2 border-top">
                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-semibold text-secondary small">Xếp theo:</span>
                                <div className="form-check form-check-inline m-0">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="sortOptions"
                                        id="sortNew"
                                        checked={sortBy === 'newest'}
                                        onChange={() => setSortBy('newest')}
                                    />
                                    <label className="form-check-label small" htmlFor="sortNew">Hàng mới</label>
                                </div>
                                <div className="form-check form-check-inline m-0">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="sortOptions"
                                        id="sortAsc"
                                        checked={sortBy === 'price-asc'}
                                        onChange={() => setSortBy('price-asc')}
                                    />
                                    <label className="form-check-label small" htmlFor="sortAsc">Giá thấp đến cao</label>
                                </div>
                                <div className="form-check form-check-inline m-0">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="sortOptions"
                                        id="sortDesc"
                                        checked={sortBy === 'price-desc'}
                                        onChange={() => setSortBy('price-desc')}
                                    />
                                    <label className="form-check-label small" htmlFor="sortDesc">Giá cao xuống thấp</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {filteredBikes.length > 0 ? (
                        <div className="row g-4">
                            {filteredBikes.map((bike: any) => (
                                <BikeCard key={bike.id} bike={bike} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white text-center py-5 rounded border text-muted">
                            <i className="fa-solid fa-box-open fs-1 mb-2 text-secondary"></i>
                            <p className="fs-5 mb-0">Không tìm thấy sản phẩm nào phù hợp.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}