import { lazy, Suspense, useState } from 'react';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import BiketList from './components/home/BikeList.tsx';
import Cart from './components/cart/Cart';
import CartDrawer from './components/cart/CartDrawer';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginModal from './components/auth/LoginModal';
import Checkout from './components/checkout/Checkout';
import OrderSuccess from './components/checkout/OrderSuccess';
import type { OrderRecord } from './services/checkoutService';
import { addNotification } from './services/customerService';

const OrderHistory = lazy(() => import('./components/history/OrderHistory'));

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState<string | string[]>('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
  const { cartItems, clearCart } = useCart();

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

        {currentTab === 'checkout' && (
          <Checkout
            items={cartItems}
            onCancel={() => setCurrentTab('cart')}
            onOrderCreated={(order) => {
              clearCart();
              if (order.userId) {
                addNotification(order.userId, 'Đặt hàng thành công', `Đơn ${order.id} đã được ghi nhận.`, 'order');
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

                <div style={{ display: currentTab === 'cart' ? 'block' : 'none' }}>
                    <Cart
                        onContinueShopping={() => setCurrentTab('home')}
                        onCheckout={(items) => {
                            setCheckoutItems(items);
                            setCurrentTab('checkout');
                        }}
                    />
                </div>

                {currentTab === 'wishlist' && (
                    <ProtectedRoute
                        onRedirectHome={() => setCurrentTab('home')}
                        routeName="Sản phẩm yêu thích"
                    >
                        <WishlistPage
                            onContinueShopping={() => setCurrentTab('home')}
                            onSelectBike={(bike) => {
                                setSelectedBike(bike);
                                setCurrentTab('home');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            onMoveToCart={(bikeItem) => {
                                const res = addToCart(bikeItem, 1);
                                setIsCartDrawerOpen(true);
                                return res;
                            }}
                        />
                    </ProtectedRoute>
                )}

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
                            <OrderHistory
                                onContinueShopping={() => setCurrentTab('home')}
                                onViewCart={() => setCurrentTab('cart')}
                            />
                        </Suspense>
                    </ProtectedRoute>
                )}

                {currentTab === 'about' && (
                    <AboutPage onGoHome={() => handleSelectTab('home')} />
                )}

                {currentTab !== 'home' &&
                    currentTab !== 'cart' &&
                    currentTab !== 'wishlist' &&
                    currentTab !== 'history' &&
                    currentTab !== 'account' &&
                    currentTab !== 'checkout' &&
                    currentTab !== 'about' &&
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
                <WishlistProvider>
                    <CartProvider>
                        <MainLayout />
                    </CartProvider>
                </WishlistProvider>
            </AuthProvider>
        </ToastProvider>
    );
}
