import { useState } from 'react';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import BiketList from './components/home/BiketList';
import Cart from './components/cart/Cart';
import OrderHistory from './components/history/OrderHistory';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginModal from './components/auth/LoginModal';
import BikeDetail from './components/home/BikeDetail';
import Checkout from './components/checkout/Checkout';
import OrderSuccess from './components/checkout/OrderSuccess';

function MainLayout() {
  const { addToCart, refreshCart } = useCart();
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBike, setSelectedBike] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);

  const handleSelectTab = (tabOrCategory) => {
    setSearchKeyword('');
    setSelectedBike(null);
    if (['home', 'cart', 'history', 'not-found'].includes(tabOrCategory)) {
      setCurrentTab(tabOrCategory);
      if (tabOrCategory === 'home') {
        setSelectedCategory('Tất cả');
      }
    } else {
      setCurrentTab('home');
      setSelectedCategory(tabOrCategory);
    }
  };

  const handleSearch = (keyword) => {
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
      />

      <main className="flex-grow-1">
          {currentTab === 'home' && (
            <>
              {selectedBike ? (
                  <BikeDetail
                      bike={selectedBike}
                      onBack={() => setSelectedBike(null)}
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
                         onSelectBike={(bike) => setSelectedBike(bike)}
                     />
                 </>
              )}
            </>
          )}

        {currentTab === 'cart' && (
          <Cart
            onContinueShopping={() => setCurrentTab('home')}
            onCheckout={(items) => {
              setCheckoutItems(items);
              setCurrentTab('checkout');
            }}
          />
        )}

        {currentTab === 'checkout' && (
          <Checkout
            items={checkoutItems}
            onCancel={() => setCurrentTab('cart')}
            onOrderCreated={(order) => {
              refreshCart().catch((error) => console.error('Không thể tải lại giỏ hàng:', error));
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
            <OrderHistory onContinueShopping={() => setCurrentTab('home')} />
          </ProtectedRoute>
        )}

        {currentTab !== 'home' &&
          currentTab !== 'cart' &&
          currentTab !== 'checkout' &&
          currentTab !== 'order-success' &&
          currentTab !== 'history' && (
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
