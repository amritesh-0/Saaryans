import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header/Header';
import Footer from './components/Layout/Footer/Footer';
import LoginModal from './components/Auth/LoginModal/LoginModal';
import Home from './pages/Home/Home';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import './styles/global.css';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <Router>
      <div className="app">
        <Header onLoginClick={() => setIsLoginOpen(true)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
        <Footer />
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
