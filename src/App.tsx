import { lazy, Suspense, useState } from 'react';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import BiketList from './components/home/BikeList.tsx';
import Cart from './components/cart/Cart';
<<<<<<< HEAD
import CartDrawer from './components/cart/CartDrawer';
=======
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginModal from './components/auth/LoginModal';
import Checkout from './components/checkout/Checkout';
import OrderSuccess from './components/checkout/OrderSuccess';
<<<<<<< HEAD
import type { CheckoutItem, OrderRecord } from './services/checkoutService';
import AboutPage from './components/about/AboutPage.tsx';
import BikeDetail from './components/home/BikeDetail';
import AccountPage from './components/account/AccountPage';
=======
import type { OrderRecord } from './services/checkoutService';
import AboutPage from "./components/about/AboutPage.tsx";
import BikeDetail from './components/home/BikeDetail';
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d

const OrderHistory = lazy(() => import('./components/history/OrderHistory'));

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBike, setSelectedBike] = useState<any>(null);
<<<<<<< HEAD
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { cartItems, addToCart, refreshCart } = useCart();
=======
  // const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  // const [clearCart, setClearCart] = useState<() => void>(() => () => undefined);
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const {cartItems, addToCart, clearCart } = useCart();
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d

  const handleSelectTab = (tabOrCategory: string | string[]) => {
    setSearchKeyword('');
    setSelectedBike(null);
<<<<<<< HEAD
    if (typeof tabOrCategory === 'string' && ['home', 'cart', 'history', 'about', 'account', 'not-found'].includes(tabOrCategory)) {
=======
    if (typeof tabOrCategory === 'string' && ['home', 'cart', 'history', 'about', 'not-found'].includes(tabOrCategory)) {
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
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
    setSelectedBike(null);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar
        currentTab={currentTab}
        selectedCategory={selectedCategory}
        onSelectTab={handleSelectTab}
        onSearch={handleSearch}
<<<<<<< HEAD
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        onViewCart={() => {
          setIsCartDrawerOpen(false);
          setCurrentTab('cart');
        }}
        onCheckout={() => {
          setIsCartDrawerOpen(false);
          setCheckoutItems(cartItems);
          setCurrentTab('checkout');
        }}
      />

      <main className="flex-grow-1">
        {currentTab === 'home' && (
          <>
            {selectedBike ? (
              <BikeDetail
                bike={selectedBike}
                onSelectTab={handleSelectTab}
                onAddToCart={(bike, qty) => {
                  const res = addToCart(bike, qty);
                  setIsCartDrawerOpen(true);
                  return res;
                }}
              />
            ) : (
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
                  onSelectBike={(bike: any) => {
                    setSelectedBike(bike);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </>
            )}
          </>
        )}
=======
        // cartCount={2}
      />

      <main className="flex-grow-1">
          {currentTab === 'home' && (
            <>
              {selectedBike ? (
                <BikeDetail
                   bike={selectedBike}
                   onSelectTab={handleSelectTab}
                   onAddToCart={addToCart}
                />
              ) : (
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
                      onSelectBike={(bike: any) => {
                        setSelectedBike(bike);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                   />
                </>
              )}
            </>
          )}
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d

        <div style={{ display: currentTab === 'cart' ? 'block' : 'none' }}>
          <Cart
            onContinueShopping={() => setCurrentTab('home')}
            onCheckout={(items) => {
              setCheckoutItems(items);
              setCurrentTab('checkout');
            }}
          />
        </div>

        {currentTab === 'checkout' && (
          <Checkout
            items={checkoutItems}
            onCancel={() => setCurrentTab('cart')}
            onOrderCreated={(order) => {
              if (refreshCart) {
                refreshCart().catch((error) => console.error('Không thể tải lại giỏ hàng:', error));
              }
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

        {currentTab === 'account' && (
          <ProtectedRoute
            onRedirectHome={() => setCurrentTab('home')}
            routeName="Quản lý tài khoản"
          >
            <AccountPage onGoHome={() => handleSelectTab('home')} />
          </ProtectedRoute>
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

<<<<<<< HEAD
        {currentTab === 'about' && (
          <AboutPage onGoHome={() => handleSelectTab('home')} />
        )}

        {currentTab !== 'home' &&
          currentTab !== 'cart' &&
          currentTab !== 'history' &&
          currentTab !== 'account' &&
          currentTab !== 'checkout' &&
          currentTab !== 'about' &&
          currentTab !== 'order-success' && (
=======
          {currentTab === 'about' && (
              <AboutPage onGoHome={() => handleSelectTab('home')} />
          )}

        {currentTab !== 'home' &&
        currentTab !== 'cart' &&
        currentTab !== 'history' &&
        currentTab !== 'checkout' &&
        currentTab !== 'about' &&
        currentTab !== 'order-success' && (
>>>>>>> c5829f8818321524f4d06b99f134873a21844e2d
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
        <CartProvider>
          <MainLayout />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
