import { useEffect, useState } from 'react';
import { CheckCircleIcon, CloseIcon } from '../../../assets/icons';
import './Toast.css';

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircleIcon size={20} />,
    error: <CloseIcon size={20} />,
    info: <CheckCircleIcon size={20} />,
  };

  return (
    <div className={`toast toast--${type} ${isExiting ? 'toast--exit' : ''}`} role="alert">
      <span className="toast__icon">{icons[type]}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={handleClose} aria-label="Dismiss">
        <CloseIcon size={16} />
      </button>
      <div className="toast__progress" style={{ animationDuration: `${duration}ms` }} />
    </div>
  );
};

export default Toast;
