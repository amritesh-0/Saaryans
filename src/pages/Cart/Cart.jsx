import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import StepIndicator from '../../components/UI/StepIndicator/StepIndicator';
import Button from '../../components/UI/Button/Button';
import { ShieldIcon, TruckIcon, ReturnIcon, CloseIcon, CartIcon, CheckCircleIcon } from '../../assets/icons';
import './Cart.css';

const Cart = () => {
  const {
    items,
    itemCount,
    totalMRP,
    discountOnMRP,
    couponCode,
    couponDiscount,
    couponError,
    deliveryFee,
    grandTotal,
    totalSavings,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    COUPONS,
  } = useCart();

  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [showCouponList, setShowCouponList] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      showToast(`Coupon "${couponInput.toUpperCase()}" applied successfully!`, 'success');
      setCouponInput('');
    } else {
      showToast(res.error || 'Invalid Coupon Code', 'error');
    }
  };

  const handleApplyPresetCoupon = (code) => {
    const res = applyCoupon(code);
    if (res.success) {
      showToast(`Coupon "${code}" applied!`, 'success');
      setShowCouponList(false);
    } else {
      showToast(res.error, 'error');
    }
  };

  if (items.length === 0) {
    return (
      <main className="cart-page" id="cart-empty-view">
        <div className="container">
          <StepIndicator currentStep={0} />
          <div className="cart-empty">
            <div className="cart-empty__icon">
              <CartIcon size={48} />
            </div>
            <h2 className="cart-empty__title">Your Shopping Bag is Empty</h2>
            <p className="cart-empty__desc">
              Explore our exquisite handcrafted sarees and ethnic collection to find your perfect match.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              CONTINUE SHOPPING
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page" id="cart-page">
      <div className="container">
        <StepIndicator currentStep={0} />

        <div className="cart-layout">
          {/* Left: Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h1 className="cart-items-title">
                My Shopping Bag <span>({itemCount} {itemCount === 1 ? 'Item' : 'Items'})</span>
              </h1>
              <div className="cart-total-badge">
                Total: ₹{grandTotal.toLocaleString()}
              </div>
            </div>

            {/* Free Delivery Banner */}
            <div className="cart-delivery-banner">
              <TruckIcon size={20} />
              <span>
                {deliveryFee === 0
                  ? 'Yay! You get FREE standard delivery on this order'
                  : 'Add ₹' + (999 - (totalMRP - discountOnMRP)) + ' more to get FREE Delivery'}
              </span>
            </div>

            {/* Item Cards */}
            <div className="cart-items-list">
              {items.map((item) => {
                const itemSavings = (item.originalPrice - item.price) * item.quantity;
                const itemDiscountPct = Math.round(
                  ((item.originalPrice - item.price) / item.originalPrice) * 100
                );

                return (
                  <article
                    key={`${item.id}-${item.size}`}
                    className="cart-item-card"
                    id={`cart-item-${item.id}-${item.size}`}
                  >
                    <div className="cart-item__image-wrap">
                      <Link to={`/product/${item.id}`}>
                        <img src={item.image} alt={item.name} className="cart-item__img" />
                      </Link>
                    </div>

                    <div className="cart-item__details">
                      <div className="cart-item__top">
                        <Link to={`/product/${item.id}`} className="cart-item__name">
                          {item.name}
                        </Link>
                        <button
                          className="cart-item__remove-btn"
                          onClick={() => {
                            removeFromCart(item.id, item.size);
                            showToast('Item removed from bag', 'info');
                          }}
                          aria-label="Remove item"
                        >
                          <CloseIcon size={18} />
                        </button>
                      </div>

                      <div className="cart-item__meta">
                        <span className="cart-item__badge-size">Size: <strong>{item.size}</strong></span>
                        <span className="cart-item__seller">Sold by: Saaryans Heritage</span>
                      </div>

                      <div className="cart-item__pricing">
                        <span className="cart-item__current-price">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="cart-item__original-price">
                          ₹{(item.originalPrice * item.quantity).toLocaleString()}
                        </span>
                        <span className="cart-item__discount-pct">
                          {itemDiscountPct}% OFF
                        </span>
                      </div>

                      <div className="cart-item__bottom-actions">
                        {/* Quantity Controls */}
                        <div className="cart-item__qty-control">
                          <label className="cart-item__qty-label">Qty:</label>
                          <button
                            className="cart-item__qty-btn"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="cart-item__qty-val">{item.quantity}</span>
                          <button
                            className="cart-item__qty-btn"
                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {itemSavings > 0 && (
                          <div className="cart-item__savings-tag">
                            You saved ₹{itemSavings.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right: Coupons & Price Summary (Sticky) */}
          <aside className="cart-sidebar" aria-label="Order summary and coupons">
            {/* Coupons Module */}
            <div className="cart-coupon-box">
              <h3 className="cart-coupon-title">Coupons & Offers</h3>

              {couponCode ? (
                <div className="coupon-applied-chip">
                  <div className="coupon-applied-left">
                    <span className="coupon-applied-tag">
                      <CheckCircleIcon size={14} /> {couponCode}
                    </span>
                    <span className="coupon-applied-desc">Saved ₹{couponDiscount.toLocaleString()}</span>
                  </div>
                  <button
                    className="coupon-remove-link"
                    onClick={() => {
                      removeCoupon();
                      showToast('Coupon removed', 'info');
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form className="coupon-input-form" onSubmit={handleApplyCoupon}>
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="coupon-input"
                    id="coupon-code-input"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    APPLY
                  </Button>
                </form>
              )}

              {couponError && (
                <p className="coupon-error-msg">{couponError}</p>
              )}

              {/* View available coupons toggler */}
              <button
                type="button"
                className="available-coupons-toggle"
                onClick={() => setShowCouponList(!showCouponList)}
              >
                {showCouponList ? 'Hide available offers ▲' : 'View available offers ▼'}
              </button>

              {showCouponList && (
                <div className="available-coupons-list">
                  {Object.entries(COUPONS).map(([code, data]) => (
                    <div key={code} className="preset-coupon-item">
                      <div>
                        <div className="preset-coupon-code">{code}</div>
                        <div className="preset-coupon-label">{data.label}</div>
                      </div>
                      <button
                        className="preset-coupon-apply-btn"
                        onClick={() => handleApplyPresetCoupon(code)}
                      >
                        APPLY
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Details */}
            <div className="cart-price-summary">
              <h3 className="price-summary-title">PRICE DETAILS ({itemCount} Items)</h3>

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
                <span>Convenience / Delivery Fee</span>
                <span>
                  {deliveryFee === 0 ? (
                    <strong className="text-green">FREE</strong>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>

              <div className="price-summary-divider" />

              <div className="price-summary-row price-summary-row--total">
                <span>Total Amount</span>
                <span className="price-total-val">₹{grandTotal.toLocaleString()}</span>
              </div>

              {totalSavings > 0 && (
                <div className="cart-savings-banner">
                  You are saving <strong>₹{totalSavings.toLocaleString()}</strong> on this order
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => navigate('/checkout')}
                className="cart-checkout-btn"
                id="cart-place-order-btn"
              >
                PLACE ORDER
              </Button>
            </div>

            {/* Security Assurances */}
            <div className="cart-trust-footer">
              <div className="cart-trust-item">
                <ShieldIcon size={18} />
                <span>100% Secure Payments</span>
              </div>
              <div className="cart-trust-item">
                <ReturnIcon size={18} />
                <span>Easy 48hr Returns</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Cart;
