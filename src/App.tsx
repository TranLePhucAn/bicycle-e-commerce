import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const $ = (window as any).$;

    // Khởi tạo DataTables
    if ($ && $.fn.DataTable) {
      if ($.fn.DataTable.isDataTable('#bicycleTable')) {
        $('#bicycleTable').DataTable().destroy();
      }

      // Kích hoạt DataTables
      $('#bicycleTable').DataTable({
        language: {
          search: '🔍 Tìm kiếm xe đạp:',
          lengthMenu: 'Hiển thị _MENU_ xe mỗi trang',
          info: 'Đang hiển thị _START_ đến _END_ trong tổng số _TOTAL_ xe',
          paginate: {
            first: 'Đầu',
            last: 'Cuối',
            next: 'Tiếp ➡️',
            previous: '⬅️ Trước',
          },
        },
      });
    }
  }, []);

  return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h2 className="text-primary fw-bold">🚲 Bicycle E-Commerce Management</h2>
          <span className="badge bg-success p-2 fs-6">Bootstrap + jQuery + DataTables (Offline)</span>
        </div>

        {/* Bảng danh sách xe đạp sử dụng DataTables */}
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white fw-semibold">
            Danh Sách Xe Đạp Trong Cửa Hàng
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table id="bicycleTable" className="table table-striped table-bordered align-middle">
                <thead className="table-secondary">
                <tr>
                  <th>Mã Xe</th>
                  <th>Tên Xe Đạp</th>
                  <th>Loại Xe</th>
                  <th>Giá Bán (VNĐ)</th>
                  <th>Số Lượng Kho</th>
                  <th>Trạng Thái</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>BK-001</td>
                  <td>Xe đạp địa hình MTB Giant ATX</td>
                  <td>Địa hình (MTB)</td>
                  <td>8,500,000</td>
                  <td>15</td>
                  <td><span className="badge bg-success">Còn hàng</span></td>
                </tr>
                <tr>
                  <td>BK-002</td>
                  <td>Xe đạp đua Road Twitter R10</td>
                  <td>Đua (Road)</td>
                  <td>14,200,000</td>
                  <td>8</td>
                  <td><span className="badge bg-success">Còn hàng</span></td>
                </tr>
                <tr>
                  <td>BK-003</td>
                  <td>Xe đạp đường phố Touring Trinx Free</td>
                  <td>Đường phố (Touring)</td>
                  <td>5,800,000</td>
                  <td>20</td>
                  <td><span className="badge bg-success">Còn hàng</span></td>
                </tr>
                <tr>
                  <td>BK-004</td>
                  <td>Xe đạp gấp Fornix Prava</td>
                  <td>Gấp gọn</td>
                  <td>4,100,000</td>
                  <td>5</td>
                  <td><span className="badge bg-warning text-dark">Sắp hết</span></td>
                </tr>
                <tr>
                  <td>BK-005</td>
                  <td>Xe đạp fixed gear Single Speed</td>
                  <td>Fixed Gear</td>
                  <td>3,500,000</td>
                  <td>0</td>
                  <td><span className="badge bg-danger">Hết hàng</span></td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;