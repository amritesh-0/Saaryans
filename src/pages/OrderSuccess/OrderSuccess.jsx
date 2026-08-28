import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button/Button';
import { CheckCircleIcon, TruckIcon, ShieldIcon } from '../../assets/icons';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('saaryans-latest-order');
    if (saved) {
      try {
        setOrder(JSON.parse(saved));
      } catch (e) {
        // fallback
      }
    }
  }, []);

  if (!order) {
    return (
      <main className="order-success-page container" id="order-success-page">
        <div className="order-success-card">
          <div className="success-icon-wrap">
            <CheckCircleIcon size={64} />
          </div>
          <h1 className="success-title">Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for shopping with Saaryans. We are preparing your royal ethnic wear package!
          </p>
          <div className="success-actions">
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              CONTINUE SHOPPING
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="order-success-page" id="order-success-page">
      {/* Decorative Confetti Elements */}
      <div className="confetti-container" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`confetti confetti--${i % 5}`} />
        ))}
      </div>

      <div className="container">
        <div className="order-success-card">
          {/* Header checkmark */}
          <div className="success-icon-wrap">
            <div className="success-icon-bg">
              <CheckCircleIcon size={52} />
            </div>
          </div>

          <span className="success-badge">ORDER CONFIRMED</span>
          <h1 className="success-title">Thank you for your order!</h1>
          <p className="success-subtitle">
            We have received your order and will begin processing it right away.
          </p>

          <div className="order-id-chip">
            <span>Order ID: <strong>{order.orderId}</strong></span>
            <span>•</span>
            <span>Placed on: <strong>{order.orderDate}</strong></span>
          </div>

          {/* Delivery estimation bar */}
          <div className="success-delivery-bar">
            <TruckIcon size={24} />
            <div>
              <strong>Estimated Delivery by {order.estimatedDelivery}</strong>
              <p>Standard Royal Express Delivery with live tracking updates</p>
            </div>
          </div>

          {/* Items & Address Breakdown */}
          <div className="order-details-grid">
            {/* Items Purchased */}
            <div className="order-details-block">
              <h3 className="block-title">Items in this Order ({order.items.length})</h3>
              <div className="order-items-list">
                {order.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="order-item-row">
                    <img src={item.image} alt={item.name} className="order-item-thumb" />
                    <div className="order-item-info">
                      <h4 className="order-item-name">{item.name}</h4>
                      <p className="order-item-meta">
                        Size: <strong>{item.size}</strong> | Qty: <strong>{item.quantity}</strong>
                      </p>
                      <p className="order-item-price">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Summary */}
            <div className="order-details-block">
              <h3 className="block-title">Shipping & Payment</h3>

              {order.deliveryAddress && (
                <div className="order-address-box">
                  <span className="box-subheading">Delivery Address</span>
                  <strong>{order.deliveryAddress.fullName}</strong>
                  <p>{order.deliveryAddress.address}, {order.deliveryAddress.locality}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
                  <p>Phone: {order.deliveryAddress.mobile}</p>
                </div>
              )}

              <div className="order-payment-box">
                <span className="box-subheading">Payment Method</span>
                <p><strong>{order.paymentMethod}</strong> (Payment Verified)</p>
                <div className="order-total-paid">
                  <span>Total Amount Paid:</span>
                  <strong>₹{order.totalAmount.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="success-actions">
            <Button variant="primary" size="lg" onClick={() => navigate('/')} id="success-continue-shopping-btn">
              CONTINUE SHOPPING
            </Button>
            <Button variant="outlined" size="lg" onClick={() => window.print()}>
              PRINT RECEIPT
            </Button>
          </div>

          <div className="success-support-footer">
            <ShieldIcon size={16} />
            <span>Need help with your order? Reach our 24/7 care team at care@saaryans.com</span>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderSuccess;
