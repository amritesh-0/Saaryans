import { Link } from 'react-router-dom';
import {
  FacebookIcon,
  InstagramIcon,
  TwitterIcon,
  YouTubeIcon,
  LocationIcon,
  PhoneIcon,
} from '../../../assets/icons';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="main-footer">
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            {/* Brand Column */}
            <div className="footer__brand">
              <Link to="/" className="footer__logo">
                <span className="footer__logo-icon">✾</span>
                <span className="footer__logo-text">SAARYANS</span>
              </Link>
              <p className="footer__tagline">
                Discover timeless elegance and contemporary style at Saaryans
              </p>
              <div className="footer__socials">
                <a href="#" className="footer__social-link" aria-label="Facebook"><FacebookIcon size={18} /></a>
                <a href="#" className="footer__social-link" aria-label="Instagram"><InstagramIcon size={18} /></a>
                <a href="#" className="footer__social-link" aria-label="Twitter"><TwitterIcon size={18} /></a>
                <a href="#" className="footer__social-link" aria-label="YouTube"><YouTubeIcon size={18} /></a>
              </div>
            </div>

            {/* Help */}
            <div className="footer__column">
              <h4 className="footer__column-title">HELP</h4>
              <ul className="footer__links">
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                <li><Link to="/cancellation-return">Cancellation & Return</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer__column">
              <h4 className="footer__column-title">COMPANY</h4>
              <ul className="footer__links">
                <li><Link to="/stores">Our Stores</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/pay-online">Pay Online</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer__column">
              <h4 className="footer__column-title">CONTACT</h4>
              <div className="footer__contact-item">
                <LocationIcon size={16} />
                <span>4th Floor, Saaryans Silk<br />Ahmedabad, India</span>
              </div>
              <div className="footer__contact-item">
                <PhoneIcon size={16} />
                <div>
                  <span className="footer__contact-label">INTERNATIONAL:</span>
                  <span>+91 12345 67890</span>
                </div>
              </div>
            </div>

            {/* Payments */}
            <div className="footer__column">
              <h4 className="footer__column-title">PAYMENTS</h4>
              <div className="footer__payments">
                <div className="footer__payment-badge">VISA</div>
                <div className="footer__payment-badge">UPI</div>
                <div className="footer__payment-badge">MasterCard</div>
                <div className="footer__payment-badge">RuPay</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer__bottom">
        <div className="container">
          <p className="footer__copyright">
            @2024 SAARYANS. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
