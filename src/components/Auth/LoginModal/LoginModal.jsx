import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloseIcon,
  EyeIcon,
  EyeOffIcon,
  FacebookIcon,
  GoogleIcon,
} from '../../../assets/icons';
import Button from '../../UI/Button/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, demoLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
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
    login(email, password);
    showToast('Signed in successfully! Welcome to Saaryans.', 'success');
    onClose();
    navigate('/account');
  };

  const handleDemoLogin = () => {
    demoLogin();
    showToast('Welcome back, Priya! (Demo Account Active)', 'success');
    onClose();
    navigate('/account');
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

        {/* 1-Click Demo Login Banner */}
        <div className="demo-login-box">
          <div className="demo-login-info">
            <span className="demo-avatar">P</span>
            <div>
              <strong>Quick Demo Login</strong>
              <p>Priya Sharma (Royal Gold Member)</p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDemoLogin}
            id="quick-demo-login-btn"
          >
            Instant Login
          </Button>
        </div>

        <div className="login-modal__divider">
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

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

          <Button
            type="button"
            variant="outlined"
            fullWidth
            size="lg"
            onClick={handleDemoLogin}
          >
            Use Mobile OTP Instead
          </Button>
        </form>

        <a href="#forgot" onClick={(e) => { e.preventDefault(); showToast('Password reset link sent to demo email!', 'info'); }} className="login-modal__forgot">
          Forget Password?
        </a>

        <div className="login-modal__social">
          <button type="button" onClick={handleDemoLogin} className="login-modal__social-btn" aria-label="Login with Facebook">
            <FacebookIcon size={20} />
          </button>
          <button type="button" onClick={handleDemoLogin} className="login-modal__social-btn" aria-label="Login with Google">
            <GoogleIcon size={20} />
          </button>
        </div>

        <p className="login-modal__signup">
          Don't have an account?{' '}
          <a href="#signup" onClick={(e) => { e.preventDefault(); handleDemoLogin(); }} className="login-modal__signup-link">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
