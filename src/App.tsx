import { lazy, Suspense, useState } from 'react';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import BiketList from './components/home/BiketList.tsx';
import Cart from './components/cart/Cart';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginModal from './components/auth/LoginModal';
import Checkout from './components/checkout/Checkout';
import OrderSuccess from './components/checkout/OrderSuccess';
import type { CheckoutItem, OrderRecord } from './services/checkoutService';

const OrderHistory = lazy(() => import('./components/history/OrderHistory'));

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [clearCart, setClearCart] = useState<() => void>(() => () => undefined);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);

  const handleSelectTab = (tabOrCategory: string | string[]) => {
    setSearchKeyword('');
    if (typeof tabOrCategory === 'string' && ['home', 'cart', 'history', 'not-found'].includes(tabOrCategory)) {
      setCurrentTab(tabOrCategory);
      if (tabOrCategory === 'home') setSelectedCategory('Tất cả');
      return;
    }

    setCurrentTab('home');
    setSelectedCategory(tabOrCategory);
  };

  const handleSearch = (keyword: string) => {
    setCurrentTab('home');
    setSelectedCategory('Tất cả');
    setSearchKeyword(keyword);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar
        currentTab={currentTab}
        selectedCategory={selectedCategory}
        onSelectTab={handleSelectTab}
        onSearch={handleSearch}
        cartCount={2}
      />

      <main className="flex-grow-1">
        {currentTab === 'home' && (
          <>
            {selectedCategory === 'Tất cả' && !searchKeyword && (
              <div className="app-container">
                <Hero />
              </div>
            )}
            <BiketList
              selectedCategory={selectedCategory}
              searchKeyword={searchKeyword}
              onSelectTab={handleSelectTab}
            />
          </>
        )}

        <div style={{ display: currentTab === 'cart' ? 'block' : 'none' }}>
          <Cart
            onContinueShopping={() => setCurrentTab('home')}
            onCheckout={(items, clear) => {
              setCheckoutItems(items);
              setClearCart(() => clear);
              setCurrentTab('checkout');
            }}
          />
        </div>

        {currentTab === 'checkout' && (
          <Checkout
            items={checkoutItems}
            onCancel={() => setCurrentTab('cart')}
            onOrderCreated={(order) => {
              clearCart();
              setCreatedOrder(order);
              setCurrentTab('order-success');
            }}
          />
        )}

        {currentTab === 'order-success' && createdOrder && (
          <OrderSuccess
            order={createdOrder}
            onContinueShopping={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'history' && (
          <ProtectedRoute
            onRedirectHome={() => setCurrentTab('home')}
            routeName="Lịch sử đơn hàng"
          >
            <Suspense fallback={<div className="container py-5 text-center" role="status">Đang tải lịch sử đơn hàng...</div>}>
              <OrderHistory onContinueShopping={() => setCurrentTab('home')} />
            </Suspense>
          </ProtectedRoute>
        )}

        {        currentTab !== 'home' &&
        currentTab !== 'cart' &&
        currentTab !== 'history' &&
        currentTab !== 'checkout' &&
          currentTab !== 'order-success' && (
            <NotFound
              onGoHome={() => setCurrentTab('home')}
              onGoCart={() => setCurrentTab('cart')}
            />
          )}
      </main>

      <LoginModal />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ToastProvider>
  );
}
