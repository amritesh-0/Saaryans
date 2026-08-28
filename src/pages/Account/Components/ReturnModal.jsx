import { useState } from 'react';
import { CloseIcon, ReturnIcon, ShieldIcon } from '../../../assets/icons';
import Button from '../../../components/UI/Button/Button';
import './ReturnModal.css';

const RETURN_REASONS = [
  'Size / Fit did not match expectations',
  'Fabric or color appears different than photos',
  'Defect / Zari thread loose or damaged',
  'Received wrong item',
  'Delivery was delayed / No longer needed',
];

const ReturnModal = ({ order, isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState(RETURN_REASONS[0]);
  const [comments, setComments] = useState('');
  const [refundMode, setRefundMode] = useState('original');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(order.id, reason, refundMode);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="return-modal" role="dialog" aria-modal="true" aria-label="Request Return">
      <div className="return-modal__backdrop" onClick={onClose} />
      <div className="return-modal__dialog">
        <button className="return-modal__close" onClick={onClose} aria-label="Close">
          <CloseIcon size={22} />
        </button>

        <div className="return-modal__header">
          <div className="return-icon-circle">
            <ReturnIcon size={24} />
          </div>
          <div>
            <h2 className="return-modal__title">Request Return / Exchange</h2>
            <p className="return-modal__subtitle">Order ID: #{order.id}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="return-modal__form">
          {/* Item details */}
          <div className="return-item-preview">
            <img src={order.items[0]?.image} alt={order.items[0]?.name} className="return-item-thumb" />
            <div>
              <p className="return-item-title">{order.items[0]?.name}</p>
              <p className="return-item-meta">Size: {order.items[0]?.size} | Refund Amount: ₹{order.total.toLocaleString()}</p>
            </div>
          </div>

          {/* Reason selector */}
          <div className="return-field">
            <label>Reason for Return *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="return-select"
              required
            >
              {RETURN_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Comments */}
          <div className="return-field">
            <label>Additional Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Tell us what went wrong so we can improve..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="return-textarea"
            />
          </div>

          {/* Refund Destination */}
          <div className="return-field">
            <label>Refund Mode *</label>
            <div className="refund-options-grid">
              <label className={`refund-opt ${refundMode === 'original' ? 'refund-opt--active' : ''}`}>
                <input
                  type="radio"
                  name="refundMode"
                  value="original"
                  checked={refundMode === 'original'}
                  onChange={(e) => setRefundMode(e.target.value)}
                />
                <div>
                  <strong>Original Payment Mode</strong>
                  <p>Refund to {order.paymentMethod.split(' ')[0]} in 3-5 days</p>
                </div>
              </label>

              <label className={`refund-opt ${refundMode === 'credit' ? 'refund-opt--active' : ''}`}>
                <input
                  type="radio"
                  name="refundMode"
                  value="credit"
                  checked={refundMode === 'credit'}
                  onChange={(e) => setRefundMode(e.target.value)}
                />
                <div>
                  <strong>Saaryans Wallet Credit (+5% Bonus)</strong>
                  <p>Instant refund of ₹{(order.total * 1.05).toFixed(0)} for next purchase</p>
                </div>
              </label>
            </div>
          </div>

          {/* Free Pickup Note */}
          <div className="return-pickup-note">
            <ShieldIcon size={18} />
            <div>
              <strong>Hassle-Free Free Doorstep Pickup</strong>
              <p>Our courier partner will pick up the item in 24-48 hours. Keep tags intact.</p>
            </div>
          </div>

          <div className="return-modal__actions">
            <Button type="button" variant="outlined" size="md" onClick={onClose} disabled={isSubmitting}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'SCHEDULING PICKUP...' : 'CONFIRM RETURN'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnModal;
