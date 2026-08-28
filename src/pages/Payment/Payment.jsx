import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import StepIndicator from '../../components/UI/StepIndicator/StepIndicator';
import Button from '../../components/UI/Button/Button';
import { ShieldIcon, CheckCircleIcon } from '../../assets/icons';
import './Payment.css';

const Payment = () => {
  const { items, itemCount, grandTotal, totalMRP, discountOnMRP, couponCode, couponDiscount, deliveryFee, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states for methods
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  const [selectedBank, setSelectedBank] = useState('HDFC');

  useEffect(() => {
    const savedAddress = sessionStorage.getItem('saaryans-delivery-address');
    if (savedAddress) {
      try {
        setDeliveryAddress(JSON.parse(savedAddress));
      } catch (e) {
        // fallback
      }
    } else {
      // Fallback demo address
      setDeliveryAddress({
        fullName: 'Priya Sharma',
        mobile: '9876543210',
        pincode: '380015',
        address: 'Flat 402, Royal Palms Residency',
        locality: 'Bodakdev, SG Highway',
        city: 'Ahmedabad',
        state: 'Gujarat',
      });
    }
  }, []);

  if (items.length === 0 && !isProcessing) {
    return (
      <main className="payment-page container">
        <div className="payment-empty">
          <h2>Your bag is empty</h2>
          <Link to="/">Go to Shop</Link>
        </div>
      </main>
    );
  }

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handlePay = (e) => {
    e.preventDefault();

    // Validation per method
    if (selectedMethod === 'upi' && !upiId.trim() && selectedUpiApp === 'custom') {
      showToast('Please enter a valid UPI ID (e.g. name@okhdfcbank)', 'error');
      return;
    }

    if (selectedMethod === 'card') {
      if (cardData.number.replace(/\s/g, '').length < 16) {
        showToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
      if (!cardData.expiry || !cardData.cvv) {
        showToast('Please fill all card details', 'error');
        return;
      }
    }

    // Start payment processing simulation
    setIsProcessing(true);

    const orderId = `SAR-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    const finalOrder = {
      orderId,
      items: [...items],
      totalAmount: grandTotal,
      itemCount,
      deliveryAddress,
      paymentMethod: selectedMethod.toUpperCase(),
      orderDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    sessionStorage.setItem('saaryans-latest-order', JSON.stringify(finalOrder));

    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      navigate('/order-success');
    }, 2000);
  };

  return (
    <main className="payment-page" id="payment-page">
      <div className="container">
        <StepIndicator currentStep={2} />

        {isProcessing && (
          <div className="payment-processing-overlay" role="dialog" aria-modal="true">
            <div className="payment-processing-box">
              <div className="payment-spinner" />
              <h3>Processing Secure Payment...</h3>
              <p>Connecting with payment gateway. Please do not refresh or close.</p>
              <div className="payment-security-shield">
                <ShieldIcon size={18} />
                <span>256-Bit SSL Encrypted Transaction</span>
              </div>
            </div>
          </div>
        )}

        <div className="payment-layout">
          {/* Left: Payment Method Options */}
          <div className="payment-methods-section">
            <h1 className="payment-title">Choose Payment Mode</h1>

            <div className="payment-methods-tabs">
              {/* UPI Option */}
              <div
                className={`payment-method-card ${selectedMethod === 'upi' ? 'payment-method-card--active' : ''}`}
                onClick={() => setSelectedMethod('upi')}
              >
                <div className="payment-method-header">
                  <input
                    type="radio"
                    id="method-upi"
                    name="paymentMethod"
                    checked={selectedMethod === 'upi'}
                    onChange={() => setSelectedMethod('upi')}
                  />
                  <label htmlFor="method-upi" className="payment-method-label">
                    <span className="payment-method-name">UPI / QR (Google Pay, PhonePe, Paytm)</span>
                    <span className="payment-method-tag">Instant & 0% Fee</span>
                  </label>
                </div>

                {selectedMethod === 'upi' && (
                  <div className="payment-method-body" onClick={(e) => e.stopPropagation()}>
                    <div className="upi-app-grid">
                      {[
                        { id: 'gpay', name: 'Google Pay' },
                        { id: 'phonepe', name: 'PhonePe' },
                        { id: 'paytm', name: 'Paytm' },
                        { id: 'custom', name: 'Other UPI ID' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          className={`upi-app-btn ${selectedUpiApp === app.id ? 'upi-app-btn--active' : ''}`}
                          onClick={() => setSelectedUpiApp(app.id)}
                        >
                          <span>{app.name}</span>
                        </button>
                      ))}
                    </div>

                    {selectedUpiApp === 'custom' ? (
                      <div className="upi-input-wrap">
                        <input
                          type="text"
                          placeholder="Enter your UPI ID (e.g. mobile@upi)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="upi-input"
                          id="upi-id-input"
                        />
                      </div>
                    ) : (
                      <div className="upi-ready-note">
                        <span>Click Pay to receive a payment prompt on your {selectedUpiApp.toUpperCase()} app.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Credit/Debit Card Option */}
              <div
                className={`payment-method-card ${selectedMethod === 'card' ? 'payment-method-card--active' : ''}`}
                onClick={() => setSelectedMethod('card')}
              >
                <div className="payment-method-header">
                  <input
                    type="radio"
                    id="method-card"
                    name="paymentMethod"
                    checked={selectedMethod === 'card'}
                    onChange={() => setSelectedMethod('card')}
                  />
                  <label htmlFor="method-card" className="payment-method-label">
                    <span className="payment-method-name">Credit / Debit Card</span>
                    <span className="payment-method-tag">Visa, Mastercard, RuPay</span>
                  </label>
                </div>

                {selectedMethod === 'card' && (
                  <div className="payment-method-body" onClick={(e) => e.stopPropagation()}>
                    <div className="card-form-grid">
                      <div className="form-field full-width">
                        <label>Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={cardData.number}
                          onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                          id="card-number-input"
                        />
                      </div>
                      <div className="form-field full-width">
                        <label>Name on Card</label>
                        <input
                          type="text"
                          placeholder="e.g. Priya Sharma"
                          value={cardData.name}
                          onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                          id="card-name-input"
                        />
                      </div>
                      <div className="form-field">
                        <label>Valid Thru (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="MM/YY"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          id="card-expiry-input"
                        />
                      </div>
                      <div className="form-field">
                        <label>CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="CVV"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          id="card-cvv-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Net Banking Option */}
              <div
                className={`payment-method-card ${selectedMethod === 'netbanking' ? 'payment-method-card--active' : ''}`}
                onClick={() => setSelectedMethod('netbanking')}
              >
                <div className="payment-method-header">
                  <input
                    type="radio"
                    id="method-netbanking"
                    name="paymentMethod"
                    checked={selectedMethod === 'netbanking'}
                    onChange={() => setSelectedMethod('netbanking')}
                  />
                  <label htmlFor="method-netbanking" className="payment-method-label">
                    <span className="payment-method-name">Net Banking</span>
                    <span className="payment-method-tag">All Indian Banks</span>
                  </label>
                </div>

                {selectedMethod === 'netbanking' && (
                  <div className="payment-method-body" onClick={(e) => e.stopPropagation()}>
                    <div className="bank-grid">
                      {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          className={`bank-btn ${selectedBank === bank ? 'bank-btn--active' : ''}`}
                          onClick={() => setSelectedBank(bank)}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cash On Delivery Option */}
              <div
                className={`payment-method-card ${selectedMethod === 'cod' ? 'payment-method-card--active' : ''}`}
                onClick={() => setSelectedMethod('cod')}
              >
                <div className="payment-method-header">
                  <input
                    type="radio"
                    id="method-cod"
                    name="paymentMethod"
                    checked={selectedMethod === 'cod'}
                    onChange={() => setSelectedMethod('cod')}
                  />
                  <label htmlFor="method-cod" className="payment-method-label">
                    <span className="payment-method-name">Cash on Delivery (COD)</span>
                    <span className="payment-method-tag">Pay at doorstep</span>
                  </label>
                </div>

                {selectedMethod === 'cod' && (
                  <div className="payment-method-body" onClick={(e) => e.stopPropagation()}>
                    <p className="cod-note">
                      You can pay in cash or via UPI to our delivery partner upon doorstep delivery.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Price Summary + Address Snippet + Pay Button */}
          <aside className="payment-sidebar" aria-label="Payment summary">
            {/* Delivery address snippet */}
            {deliveryAddress && (
              <div className="delivery-address-snippet">
                <div className="snippet-top">
                  <span className="snippet-title">DELIVERING TO</span>
                  <Link to="/checkout" className="snippet-change-btn">Change</Link>
                </div>
                <div className="snippet-body">
                  <strong>{deliveryAddress.fullName}</strong>
                  <p>{deliveryAddress.address}, {deliveryAddress.locality}</p>
                  <p>{deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}</p>
                  <p>Mobile: {deliveryAddress.mobile}</p>
                </div>
              </div>
            )}

            {/* Price Details */}
            <div className="payment-price-summary">
              <h3 className="summary-heading">PRICE DETAILS ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})</h3>

              <div className="price-summary-row">
                <span>Total MRP</span>
                <span>₹{totalMRP.toLocaleString()}</span>
              </div>
              <div className="price-summary-row price-summary-row--green">
                <span>Discount on MRP</span>
                <span>- ₹{discountOnMRP.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="price-summary-row price-summary-row--green">
                  <span>Coupon ({couponCode})</span>
                  <span>- ₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="price-summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-green">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="price-summary-divider" />

              <div className="price-summary-row price-summary-row--total">
                <span>Total Amount</span>
                <span className="price-total-val">₹{grandTotal.toLocaleString()}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handlePay}
                id="pay-now-btn"
                className="payment-pay-btn"
              >
                {selectedMethod === 'cod' ? 'PLACE ORDER (COD)' : `PAY ₹${grandTotal.toLocaleString()}`}
              </Button>
            </div>

            <div className="payment-security-badge">
              <ShieldIcon size={20} />
              <span>Safe & Secure 256-Bit Encrypted Payments</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Payment;
