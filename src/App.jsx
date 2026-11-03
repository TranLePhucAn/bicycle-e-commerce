import { useState } from 'react';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import ProductList from './components/home/ProductList';
import Cart from './components/cart/Cart';
import OrderHistory from './components/history/OrderHistory';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginModal from './components/auth/LoginModal';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('home');

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} cartCount={2} />

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
          <ProtectedRoute
            onRedirectHome={() => setCurrentTab('home')}
            routeName="Lịch sử đơn hàng"
          >
            <OrderHistory onContinueShopping={() => setCurrentTab('home')} />
          </ProtectedRoute>
        )}

        {currentTab !== 'home' &&
          currentTab !== 'cart' &&
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
        <MainLayout />
      </AuthProvider>
    </ToastProvider>
  );
}
