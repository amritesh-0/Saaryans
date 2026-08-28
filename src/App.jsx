import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Layout/Header/Header';
import Footer from './components/Layout/Footer/Footer';
import LoginModal from './components/Auth/LoginModal/LoginModal';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Payment from './pages/Payment/Payment';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';
import Account from './pages/Account/Account';
import Wishlist from './pages/Wishlist/Wishlist';
import './styles/global.css';

// Component to scroll to top automatically on ANY route or query change
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, search]);

  return null;
}

function AppContent() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="app">
      <ScrollToTop />
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/account" element={<Account />} />
        {/* Fallback routes for footer & category links */}
        <Route path="/category/:slug" element={<Home />} />
        <Route path="/about" element={<Home />} />
        <Route path="/contact" element={<Home />} />
        <Route path="/privacy-policy" element={<Home />} />
        <Route path="/shipping-policy" element={<Home />} />
        <Route path="/cancellation-return" element={<Account />} />
        <Route path="/terms" element={<Home />} />
        <Route path="/stores" element={<Home />} />
        <Route path="/pay-online" element={<Payment />} />
      </Routes>
      <Footer />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
