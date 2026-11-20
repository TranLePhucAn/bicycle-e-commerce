import { lazy, Suspense, useState } from 'react';
import './App.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/layout/Hero';
import BikeList from './components/home/BikeList';
import BikeDetail from './components/home/BikeDetail';
import Cart from './components/cart/Cart';
import CartDrawer from './components/cart/CartDrawer';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './components/common/NotFound';
import LoginModal from './components/auth/LoginModal';
import Checkout from './components/checkout/Checkout';
import OrderSuccess from './components/checkout/OrderSuccess';
import WishlistPage from './components/wishlist/WishlistPage';
import AccountPage from './components/account/AccountPage';
import AboutPage from './components/about/AboutPage';
import type { CheckoutItem, OrderRecord } from './services/checkoutService';
import { addNotification } from './services/customerService';

const OrderHistory = lazy(() => import('./components/history/OrderHistory'));

function MainLayout() {
    const [currentTab, setCurrentTab] = useState('home');
    const [selectedCategory, setSelectedCategory] = useState<string | string[]>('Tất cả');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedBike, setSelectedBike] = useState<any>(null);
    const [createdOrder, setCreatedOrder] = useState<OrderRecord | null>(null);
    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const { addToCart, refreshCart } = useCart();

    const handleSelectTab = (tabOrCategory: string | string[]) => {
        setSearchKeyword('');
        setSelectedBike(null);
        setIsCartDrawerOpen(false);
        if (typeof tabOrCategory === 'string' && ['home', 'cart', 'history', 'wishlist', 'account', 'about', 'not-found'].includes(tabOrCategory)) {
            setCurrentTab(tabOrCategory);
            if (tabOrCategory === 'home') setSelectedCategory('Tất cả');
        } else {
            setCurrentTab('home');
            setSelectedCategory(tabOrCategory);
        }
    };

    const handleSearch = (keyword: string) => {
        setCurrentTab('home');
        setSelectedCategory('Tất cả');
        setSearchKeyword(keyword);
        setSelectedBike(null);
        setIsCartDrawerOpen(false);
    };

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar
                currentTab={currentTab}
                selectedCategory={selectedCategory}
                onSelectTab={handleSelectTab}
                onSearch={handleSearch}
                onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
            />

            <main className="flex-grow-1">
                {currentTab === 'home' && (
                    <>
                        {selectedBike ? (
                            <BikeDetail
                                bike={selectedBike}
                                onSelectTab={handleSelectTab}
                                onSelectBike={(bike) => {
                                    setSelectedBike(bike);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                onAddToCart={(bike, quantity) => {
                                    const result = addToCart(bike, quantity);
                                    setIsCartDrawerOpen(true);
                                    return result;
                                }}
                            />
                        ) : (
                            <>
                                {selectedCategory === 'Tất cả' && !searchKeyword && (
                                    <div className="app-container">
                                        <Hero />
                                    </div>
                                )}
                                <BikeList
                                    selectedCategory={selectedCategory}
                                    searchKeyword={searchKeyword}
                                    onSelectTab={handleSelectTab}
                                    onSelectBike={(bike) => {
                                        setSelectedBike(bike);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
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
                            onMoveToCart={(bike) => {
                                const result = addToCart(bike, 1);
                                setIsCartDrawerOpen(true);
                                return result;
                            }}
                        />
                    </ProtectedRoute>
                )}

                {currentTab === 'checkout' && (
                    <Checkout
                        items={checkoutItems}
                        onCancel={() => setCurrentTab('cart')}
                        onOrderCreated={(order) => {
                            if (order.userId) {
                                addNotification(order.userId, 'Đặt hàng thành công', `Đơn ${order.id} đã được ghi nhận.`, 'order');
                            }
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

            <CartDrawer
                isOpen={isCartDrawerOpen}
                onClose={() => setIsCartDrawerOpen(false)}
                onViewCart={() => {
                    setIsCartDrawerOpen(false);
                    setCurrentTab('cart');
                }}
                onCheckout={(items) => {
                    setCheckoutItems(items);
                    setIsCartDrawerOpen(false);
                    setCurrentTab('checkout');
                }}
            />
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
