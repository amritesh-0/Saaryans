import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SearchIcon,
  UserIcon,
  HeartIcon,
  CartIcon,
  WhatsAppIcon,
  MenuIcon,
  CloseIcon,
} from '../../../assets/icons';
import { navCategories } from '../../../data/categories';
import { useCart } from '../../../context/CartContext';
import './Header.css';

const Header = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`} id="main-header">
      {/* Top Bar */}
      <div className="header__top">
        <div className="header__top-inner container">
          <nav className="header__top-links" aria-label="Secondary navigation">
            <Link to="/about" className="header__top-link">ABOUT</Link>
            <Link to="/contact" className="header__top-link">CONTACT</Link>
          </nav>

          <Link to="/" className="header__logo" aria-label="Saaryans Home">
            <span className="header__logo-icon">✾</span>
            <span className="header__logo-text">SAARYANS</span>
          </Link>

          <div className="header__actions">
            <button
              className="header__action-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              id="search-toggle"
            >
              <SearchIcon size={20} />
            </button>
            <button
              className="header__action-btn"
              onClick={onLoginClick}
              aria-label="Account"
              id="account-btn"
            >
              <UserIcon size={20} />
            </button>
            <button className="header__action-btn" aria-label="Wishlist" id="wishlist-btn">
              <HeartIcon size={20} />
            </button>
            <Link to="/cart" className="header__action-btn header__action-btn--cart" aria-label="Cart" id="cart-btn">
              <CartIcon size={20} />
              {itemCount > 0 && <span className="header__cart-count">{itemCount}</span>}
            </Link>
            <a
              href="https://wa.me/1234567890"
              className="header__action-btn header__action-btn--whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon size={20} />
            </a>
            <button
              className="header__mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="header__search-overlay">
          <div className="container">
            <div className="header__search-bar">
              <SearchIcon size={20} />
              <input
                type="text"
                placeholder="Search for sarees, kurtis, lehengas..."
                className="header__search-input"
                autoFocus
                id="search-input"
              />
              <button
                className="header__search-close"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <CloseIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Nav */}
      <nav className="header__nav" aria-label="Primary navigation">
        <div className="header__nav-inner container">
          <ul className="header__nav-list">
            {navCategories.map((cat) => (
              <li key={cat} className="header__nav-item">
                <Link
                  to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className="header__nav-link"
                >
                  {cat.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="header__mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="header__mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="header__mobile-header">
              <span className="header__logo-text">SAARYANS</span>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                <CloseIcon size={24} />
              </button>
            </div>
            <ul className="header__mobile-nav">
              {navCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="header__mobile-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="header__mobile-footer">
              <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
