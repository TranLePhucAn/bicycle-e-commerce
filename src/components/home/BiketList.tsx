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

import bikesData from '../../data/bikes.json';
import BikeCard from './BikeCard';
import '../../styles/home.css';

interface BikeListProps {
    selectedCategory?: string | string[];
}

export default function BikeList({ selectedCategory = 'Tất cả' }: BikeListProps) {
    const filteredBikes = Array.isArray(selectedCategory)
        ? bikesData.filter((bike: any) => selectedCategory.includes(bike.category))
        : selectedCategory === 'Tất cả'
            ? bikesData
            : bikesData.filter((bike: any) => bike.category === selectedCategory);

    const getTitle = () => {
        if (Array.isArray(selectedCategory)) {
            return 'DANH MỤC: XE ĐIỆN & GẤP';
        }
        return selectedCategory === 'Tất cả'
            ? 'DANH SÁCH XE ĐẠP NỔI BẬT'
            : `${selectedCategory.toUpperCase()}`;
    };

    return (
        <section className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark m-0 border-start border-4 border-dark ps-3">
                    {getTitle()} {selectedCategory !== 'Tất cả' && `(${filteredBikes.length} sản phẩm)`}
                </h3>
            </div>

            {filteredBikes.length > 0 ? (
                <div className="row g-4">
                    {filteredBikes.map((bike: any) => (
                        <BikeCard key={bike.id} bike={bike} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-5 text-muted">
                    <p className="fs-5">Hiện chưa có sản phẩm nào trong danh mục này.</p>
                </div>
            )}
        </section>
    );
}