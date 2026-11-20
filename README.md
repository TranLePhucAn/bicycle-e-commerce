# BikeShop

Ứng dụng React dùng Vite, có API Node.js chạy cùng trong môi trường phát triển.

## Chạy dự án

```bash
npm install
npm run dev
```

Trên Windows PowerShell, có thể chạy `npm.cmd run dev`. Lệnh này khởi động API ở cổng `3001` và giao diện Vite ở địa chỉ được in trong cửa sổ Run/Terminal. Nhấn `Ctrl+C` để dừng cả hai.

## Dữ liệu

API lưu xe, tài khoản, giỏ hàng, đơn hàng và tồn kho trong `server/data/store.json`. Tệp được tạo tự động khi chạy API lần đầu và không đưa vào Git. Danh mục xe ban đầu được nạp từ `src/data/bikes.json`.

Các route API chính:

- `GET /api/bikes`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `DELETE /api/cart`
- `POST /api/orders`, `GET /api/orders/me`

Tài khoản demo khi API khởi tạo lần đầu: `an.tran@example.com` / `password123` hoặc `demo@bikeshop.vn` / `password123`.

`npm run api` chạy riêng API; `npm run dev:web` chạy riêng Vite khi API đã được khởi động.
