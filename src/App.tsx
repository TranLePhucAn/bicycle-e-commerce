import { useState } from 'react';
import './App.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import ProductList from './components/home/ProductList';
import Cart from './components/cart/Cart';
import OrderHistory from './components/history/OrderHistory';

function App() {
  // Quản lý tab hiện tại: 'home' | 'cart' | 'history'
  const [currentTab, setCurrentTab] = useState<'home' | 'cart' | 'history'>('home');

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* 1. Header & Navigation (hỗ trợ chuyển tab qua props) */}
      <Navbar currentTab={currentTab} onSelectTab={(tab: string) => setCurrentTab(tab as any)} cartCount={2} />

      {/* 2. Thanh điều hướng tab nhanh (Quick Tab Pills) */}
      <div className="bg-white border-bottom shadow-sm py-2">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="nav nav-pills gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                currentTab === 'home' ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setCurrentTab('home')}
            >
              <i className="fa-solid fa-house me-1"></i> Trang chủ
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                currentTab === 'cart' ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setCurrentTab('cart')}
            >
              <i className="fa-solid fa-cart-shopping me-1"></i> Giỏ hàng
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                currentTab === 'history' ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setCurrentTab('history')}
            >
              <i className="fa-solid fa-clock-rotate-left me-1"></i> Lịch sử đơn hàng
            </button>
          </div>

          <span className="badge bg-secondary d-none d-md-inline-block">
            Đang xem: {currentTab === 'home' ? 'Trang chủ' : currentTab === 'cart' ? 'Giỏ hàng' : 'Lịch sử đơn hàng'}
          </span>
        </div>
      </div>

      {/* 3. Nội dung chuyển đổi động theo từng Tab */}
      <main className="flex-grow-1">
        {currentTab === 'home' && (
          <>
            <div className="app-container">
              <Hero />
            </div>
            <ProductList />
          </>
        )}

        {currentTab === 'cart' && (
          <Cart onContinueShopping={() => setCurrentTab('home')} />
        )}

        {currentTab === 'history' && (
          <OrderHistory onContinueShopping={() => setCurrentTab('home')} />
        )}
      </main>

      {/* 4. Footer */}
      <Footer />
    </div>
  );
}

export default App;
