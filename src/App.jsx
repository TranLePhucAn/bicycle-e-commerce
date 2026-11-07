import { useState } from 'react';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import BiketList from './components/home/BiketList';
import Cart from './components/cart/Cart';
import OrderHistory from './components/history/OrderHistory';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginModal from './components/auth/LoginModal';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSelectTab = (tabOrCategory) => {
    setSearchKeyword('');
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
