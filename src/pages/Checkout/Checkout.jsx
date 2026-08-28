import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import StepIndicator from '../../components/UI/StepIndicator/StepIndicator';
import Button from '../../components/UI/Button/Button';
import { LocationIcon, ShieldIcon, CheckCircleIcon } from '../../assets/icons';
import './Checkout.css';

const Checkout = () => {
  const { items, itemCount, totalMRP, discountOnMRP, couponCode, couponDiscount, deliveryFee, grandTotal } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    pincode: '',
    address: '',
    locality: '',
    city: '',
    state: '',
    addressType: 'Home',
  });

  const [errors, setErrors] = useState({});

  const handleFillDemo = () => {
    setFormData({
      fullName: 'Priya Sharma',
      mobile: '9876543210',
      pincode: '380015',
      address: 'Flat 402, Royal Palms Residency',
      locality: 'SG Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      addressType: 'Home',
    });
    setErrors({});
    showToast('Demo address filled!', 'info');
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Name is required';
    if (!formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile))
      errs.mobile = 'Valid 10-digit mobile number required';
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode))
      errs.pincode = 'Valid 6-digit pincode required';
    if (!formData.address.trim()) errs.address = 'House/Building is required';
    if (!formData.locality.trim()) errs.locality = 'Street/Locality is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.state.trim()) errs.state = 'State is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    if (validate()) {
      // Save address in session/local storage for order summary
      sessionStorage.setItem('saaryans-delivery-address', JSON.stringify(formData));
      showToast('Delivery address saved!', 'success');
      navigate('/payment');
    } else {
      showToast('Please fill all required address fields', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <main className="checkout-page container">
        <div className="checkout-empty">
          <h2>Your bag is empty</h2>
          <Link to="/">Go to Shop</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page" id="checkout-page">
      <div className="container">
        <StepIndicator currentStep={1} />

        <div className="checkout-layout">
          {/* Left: Delivery Address Form */}
          <div className="checkout-address-section">
            <div className="checkout-section-header">
              <div className="checkout-title-wrap">
                <LocationIcon size={22} />
                <h1 className="checkout-title">Select Delivery Address</h1>
              </div>
              <button
                type="button"
                className="checkout-demo-btn"
                onClick={handleFillDemo}
              >
                ⚡ Fill Demo Address
              </button>
            </div>

            <form className="checkout-form" onSubmit={handleSubmit} id="address-form">
              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="e.g. Priya Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={errors.fullName ? 'input-error' : ''}
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="mobile">10-Digit Mobile Number *</label>
                  <input
                    type="tel"
                    id="mobile"
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className={errors.mobile ? 'input-error' : ''}
                  />
                  {errors.mobile && <span className="field-error">{errors.mobile}</span>}
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    maxLength={6}
                    placeholder="e.g. 380015"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className={errors.pincode ? 'input-error' : ''}
                  />
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="locality">Locality / Area / Street *</label>
                  <input
                    type="text"
                    id="locality"
                    placeholder="e.g. Bodakdev, SG Highway"
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    className={errors.locality ? 'input-error' : ''}
                  />
                  {errors.locality && <span className="field-error">{errors.locality}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="address">Flat / House No. / Building Name *</label>
                <input
                  type="text"
                  id="address"
                  placeholder="e.g. Flat 402, Royal Palms Residency"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label htmlFor="city">City / District *</label>
                  <input
                    type="text"
                    id="city"
                    placeholder="e.g. Ahmedabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={errors.city ? 'input-error' : ''}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    placeholder="e.g. Gujarat"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={errors.state ? 'input-error' : ''}
                  />
                  {errors.state && <span className="field-error">{errors.state}</span>}
                </div>
              </div>

              {/* Address Type radio */}
              <div className="form-field">
                <label>Address Type</label>
                <div className="address-type-selector">
                  {['Home', 'Work / Office'].map((type) => (
                    <label key={type} className="address-type-option">
                      <input
                        type="radio"
                        name="addressType"
                        value={type}
                        checked={formData.addressType === type}
                        onChange={(e) => setFormData({ ...formData, addressType: e.target.value })}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="checkout-submit-row">
                <Link to="/cart" className="checkout-back-link">
                  ‹ Back to Bag
                </Link>
                <Button type="submit" variant="primary" size="lg" id="deliver-here-btn">
                  CONTINUE TO PAYMENT
                </Button>
              </div>
            </form>
          </div>

          {/* Right: Order mini-preview + Price details */}
          <aside className="checkout-sidebar" aria-label="Order review">
            <div className="checkout-order-summary">
              <h3 className="checkout-summary-title">ORDER SUMMARY ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})</h3>

              <div className="checkout-items-preview">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="checkout-preview-item">
                    <img src={item.image} alt={item.name} className="checkout-preview-img" />
                    <div className="checkout-preview-info">
                      <p className="checkout-preview-name">{item.name}</p>
                      <p className="checkout-preview-meta">Size: {item.size} | Qty: {item.quantity}</p>
                      <p className="checkout-preview-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="price-summary-divider" />

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
                  <span>Coupon Discount ({couponCode})</span>
                  <span>- ₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="price-summary-row">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-green">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="price-summary-divider" />

              <div className="price-summary-row price-summary-row--total">
                <span>Payable Amount</span>
                <span className="price-total-val">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="checkout-assurance">
              <CheckCircleIcon size={18} />
              <span>Standard delivery within 4-6 business days</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
