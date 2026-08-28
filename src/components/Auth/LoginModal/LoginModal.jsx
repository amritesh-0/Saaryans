import { useState, useEffect } from 'react';
import {
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  FacebookIcon,
  GoogleIcon,
} from '../../../assets/icons';
import Button from '../../UI/Button/Button';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic
    console.log('Login:', { email, password });
  };

  return (
    <div className="login-modal" id="login-modal" role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="login-modal__backdrop" onClick={onClose} />
      <div className="login-modal__dialog">
        <button
          className="login-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          <CloseIcon size={24} />
        </button>

        <h2 className="login-modal__title">Sign In</h2>
        <p className="login-modal__subtitle">
          Join the Saaryans community today and stay ahead of the latest fashion trends
        </p>

        <form className="login-modal__form" onSubmit={handleSubmit}>
          <div className="login-modal__field">
            <label className="login-modal__label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email address"
              className="login-modal__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-modal__field">
            <label className="login-modal__label" htmlFor="login-password">Password</label>
            <div className="login-modal__password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="login-modal__input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-modal__eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg">
            SIGN IN
          </Button>

          <Button type="button" variant="outlined" fullWidth size="lg">
            Use Mobile Number Instead
          </Button>
        </form>

        <a href="#" className="login-modal__forgot">Forget Password?</a>

        <div className="login-modal__social">
          <a href="#" className="login-modal__social-btn" aria-label="Login with Facebook">
            <FacebookIcon size={20} />
          </a>
          <a href="#" className="login-modal__social-btn" aria-label="Login with Google">
            <GoogleIcon size={20} />
          </a>
        </div>

        <p className="login-modal__signup">
          Don't have an account? <a href="#" className="login-modal__signup-link">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
