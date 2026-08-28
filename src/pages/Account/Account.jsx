import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import Button from '../../components/UI/Button/Button';
import ReturnModal from './Components/ReturnModal';
import {
  LocationIcon,
  ShieldIcon,
  CheckCircleIcon,
  TruckIcon,
  ReturnIcon,
  CloseIcon,
  UserIcon,
  PackageIcon,
  TagIcon,
  LogoutIcon,
  CrownIcon,
} from '../../assets/icons';
import './Account.css';

const Account = () => {
  const {
    user,
    isAuthenticated,
    orders,
    addresses,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    requestReturn,
  } = useAuth();

  const { showToast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = searchParams.get('tab') || 'orders';

  // State for Return Modal
  const [returnOrder, setReturnOrder] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // State for Orders Filter
  const [orderFilter, setOrderFilter] = useState('all');

  // State for Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || 'Female',
    dob: user?.dob || '1995-08-15',
  });

  // State for Address Form Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    mobile: '',
    pincode: '',
    address: '',
    locality: '',
    city: '',
    state: '',
    type: 'Home',
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const handleTabChange = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(profileForm);
    showToast('Profile details updated successfully!', 'success');
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user.name,
      mobile: user.phone.replace(/\D/g, '').slice(-10),
      pincode: '380015',
      address: '',
      locality: '',
      city: 'Ahmedabad',
      state: 'Gujarat',
      type: 'Home',
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({ ...addr });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.address || !addressForm.pincode) {
      showToast('Please fill all required address fields', 'error');
      return;
    }

    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
      showToast('Address updated!', 'success');
    } else {
      addAddress(addressForm);
      showToast('New address added!', 'success');
    }
    setIsAddressModalOpen(false);
  };

  const handleConfirmReturn = (orderId, reason, refundMode) => {
    requestReturn(orderId, reason, refundMode);
    showToast(`Return requested for #${orderId}! Courier pickup scheduled in 24-48 hours.`, 'success');
  };

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'transit') return order.status === 'In Transit';
    if (orderFilter === 'delivered') return order.status === 'Delivered';
    if (orderFilter === 'returned') return order.status.includes('Return');
    return true;
  });

  return (
    <main className="account-page" id="user-dashboard">
      <div className="container">
        {/* Dashboard Breadcrumb */}
        <nav className="account-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/account">My Account</Link>
          <span>›</span>
          <span className="breadcrumb-current">
            {currentTab === 'orders' && 'Orders & Returns'}
            {currentTab === 'profile' && 'Profile Details'}
            {currentTab === 'addresses' && 'Saved Addresses'}
            {currentTab === 'coupons' && 'Coupons & Rewards'}
          </span>
        </nav>

        <div className="account-layout">
          {/* Left Sidebar */}
          <aside className="account-sidebar" aria-label="Account navigation">
            <div className="account-user-card">
              <div className="user-avatar-large">{user.name ? user.name.charAt(0) : 'P'}</div>
              <div className="user-card-info">
                <h2 className="user-card-name">{user.name}</h2>
                <p className="user-card-email">{user.email}</p>
                <span className="user-tier-tag"><CrownIcon size={12} /> {user.membershipTier}</span>
              </div>
            </div>

            <nav className="account-nav-menu">
              <button
                className={`account-nav-item ${currentTab === 'orders' ? 'account-nav-item--active' : ''}`}
                onClick={() => handleTabChange('orders')}
                id="tab-orders-btn"
              >
                <span className="nav-item-icon"><PackageIcon size={18} /></span>
                <span className="nav-item-text">Orders & Returns</span>
                <span className="nav-item-badge">{orders.length}</span>
              </button>

              <button
                className={`account-nav-item ${currentTab === 'profile' ? 'account-nav-item--active' : ''}`}
                onClick={() => handleTabChange('profile')}
                id="tab-profile-btn"
              >
                <span className="nav-item-icon"><UserIcon size={18} /></span>
                <span className="nav-item-text">Profile Details</span>
              </button>

              <button
                className={`account-nav-item ${currentTab === 'addresses' ? 'account-nav-item--active' : ''}`}
                onClick={() => handleTabChange('addresses')}
                id="tab-addresses-btn"
              >
                <span className="nav-item-icon"><LocationIcon size={18} /></span>
                <span className="nav-item-text">Saved Addresses</span>
                <span className="nav-item-badge">{addresses.length}</span>
              </button>

              <button
                className={`account-nav-item ${currentTab === 'coupons' ? 'account-nav-item--active' : ''}`}
                onClick={() => handleTabChange('coupons')}
                id="tab-coupons-btn"
              >
                <span className="nav-item-icon"><TagIcon size={18} /></span>
                <span className="nav-item-text">Coupons & Rewards</span>
              </button>

              <div className="account-nav-divider" />

              <button
                className="account-nav-item account-nav-item--logout"
                onClick={() => {
                  logout();
                  showToast('Logged out successfully', 'info');
                  navigate('/');
                }}
              >
                <span className="nav-item-icon"><LogoutIcon size={18} /></span>
                <span className="nav-item-text">Log Out</span>
              </button>
            </nav>
          </aside>

          {/* Right Main Content */}
          <section className="account-content-panel">
            {/* ----------------- TAB 1: ORDERS & RETURNS ----------------- */}
            {currentTab === 'orders' && (
              <div className="account-tab-view" id="orders-tab-view">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Orders & Returns</h1>
                    <p className="tab-subtitle">Track deliveries, manage returns, or download invoices</p>
                  </div>

                  {/* Filter Pills */}
                  <div className="order-filters">
                    {[
                      { id: 'all', label: 'All Orders' },
                      { id: 'transit', label: 'In Transit' },
                      { id: 'delivered', label: 'Delivered' },
                      { id: 'returned', label: 'Returns' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        className={`filter-pill ${orderFilter === f.id ? 'filter-pill--active' : ''}`}
                        onClick={() => setOrderFilter(f.id)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="orders-empty-state">
                    <p>No orders found for this filter.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {filteredOrders.map((order) => (
                      <article key={order.id} className="order-card" id={`order-card-${order.id}`}>
                        <div className="order-card-header">
                          <div className="order-meta-group">
                            <span className="order-meta-id">Order #{order.id}</span>
                            <span className="order-meta-date">Placed on {order.date}</span>
                          </div>
                          <div className="order-header-right">
                            <span className={`order-status-tag order-status-tag--${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {order.status}
                            </span>
                            <span className="order-header-total">Total: ₹{order.total.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="order-card-body">
                          {order.items.map((item) => (
                            <div key={item.id} className="order-item-detail">
                              <img src={item.image} alt={item.name} className="order-item-img" />
                              <div className="order-item-desc">
                                <h3 className="order-item-title">{item.name}</h3>
                                <div className="order-item-specs">
                                  <span>Size: <strong>{item.size}</strong></span>
                                  <span>Qty: <strong>{item.quantity}</strong></span>
                                  <span>Paid: <strong>₹{(item.price * item.quantity).toLocaleString()}</strong></span>
                                </div>
                                <p className="order-item-payment-method">Paid via {order.paymentMethod}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tracking Timeline */}
                        {order.timeline && (
                          <div className="order-tracking-strip">
                            <h4 className="tracking-title">Delivery Progress</h4>
                            <div className="tracking-timeline">
                              {order.timeline.map((step, idx) => (
                                <div key={idx} className={`tracking-step ${step.done ? 'tracking-step--done' : ''}`}>
                                  <div className="tracking-dot">
                                    {step.done ? <CheckCircleIcon size={14} /> : idx + 1}
                                  </div>
                                  <div className="tracking-info">
                                    <span className="tracking-step-name">{step.title}</span>
                                    <span className="tracking-step-time">{step.time}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.returnStatus && (
                          <div className="order-return-status-box">
                            <ReturnIcon size={18} />
                            <span>{order.returnStatus}</span>
                          </div>
                        )}

                        {/* Order Action Buttons */}
                        <div className="order-card-actions">
                          {order.canReturn && (
                            <Button
                              variant="outlined"
                              size="sm"
                              onClick={() => {
                                setReturnOrder(order);
                                setIsReturnModalOpen(true);
                              }}
                            >
                              Request Return / Exchange
                            </Button>
                          )}

                          <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => {
                              showToast(`Invoice for order #${order.id} downloaded!`, 'info');
                              window.print();
                            }}
                          >
                            Download Invoice
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              addToCart(order.items[0], order.items[0].size, 1);
                              showToast('Item re-added to your Bag!', 'success');
                              navigate('/cart');
                            }}
                          >
                            Buy Again
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ----------------- TAB 2: PROFILE DETAILS ----------------- */}
            {currentTab === 'profile' && (
              <div className="account-tab-view" id="profile-tab-view">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Profile Details</h1>
                    <p className="tab-subtitle">Manage your personal information, contact info, and preferences</p>
                  </div>
                </div>

                <div className="profile-details-card">
                  <form onSubmit={handleSaveProfile} className="profile-form">
                    <div className="form-group-row">
                      <div className="form-field">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          required
                          id="profile-name-input"
                        />
                      </div>

                      <div className="form-field">
                        <label>Email Address (Primary) *</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          required
                          id="profile-email-input"
                        />
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div className="form-field">
                        <label>Mobile Number *</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          required
                          id="profile-phone-input"
                        />
                      </div>

                      <div className="form-field">
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          value={profileForm.dob}
                          onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                          id="profile-dob-input"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Gender</label>
                      <div className="gender-selector">
                        {['Female', 'Male', 'Prefer not to say'].map((g) => (
                          <label key={g} className="gender-option">
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={profileForm.gender === g}
                              onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                            />
                            <span>{g}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="profile-submit-row">
                      <Button type="submit" variant="primary" size="md" id="save-profile-btn">
                        SAVE CHANGES
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ----------------- TAB 3: SAVED ADDRESSES ----------------- */}
            {currentTab === 'addresses' && (
              <div className="account-tab-view" id="addresses-tab-view">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Saved Addresses</h1>
                    <p className="tab-subtitle">Manage multiple shipping destinations for speedy checkout</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={handleOpenAddAddress} id="add-address-btn">
                    + Add New Address
                  </Button>
                </div>

                <div className="addresses-grid">
                  {addresses.map((addr) => (
                    <div key={addr.id} className={`address-card ${addr.isDefault ? 'address-card--default' : ''}`}>
                      <div className="address-card-top">
                        <span className="address-type-badge">{addr.type}</span>
                        {addr.isDefault && <span className="address-default-badge">DEFAULT</span>}
                      </div>

                      <h3 className="address-name">{addr.fullName}</h3>
                      <p className="address-text">{addr.address}, {addr.locality}</p>
                      <p className="address-text">{addr.city}, {addr.state} - {addr.pincode}</p>
                      <p className="address-phone">Mobile: <strong>{addr.mobile}</strong></p>

                      <div className="address-card-actions">
                        {!addr.isDefault && (
                          <button
                            className="address-action-link"
                            onClick={() => {
                              setDefaultAddress(addr.id);
                              showToast('Default address updated', 'info');
                            }}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          className="address-action-link"
                          onClick={() => handleOpenEditAddress(addr)}
                        >
                          Edit
                        </button>
                        <button
                          className="address-action-link address-action-link--delete"
                          onClick={() => {
                            deleteAddress(addr.id);
                            showToast('Address deleted', 'info');
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------- TAB 4: COUPONS & REWARDS ----------------- */}
            {currentTab === 'coupons' && (
              <div className="account-tab-view" id="coupons-tab-view">
                <div className="tab-header-row">
                  <div>
                    <h1 className="tab-title">Royal Club & Rewards</h1>
                    <p className="tab-subtitle">Exclusive member perks and verified discount vouchers</p>
                  </div>
                </div>

                {/* Membership perks card */}
                <div className="rewards-membership-card">
                  <div className="rewards-membership-header">
                    <div>
                      <span className="rewards-tier-badge"><CrownIcon size={14} /> {user.membershipTier}</span>
                      <h2 className="rewards-points-total">{user.rewardPoints} <span>Available Points</span></h2>
                    </div>
                    <div className="rewards-worth-chip">Worth ₹{user.rewardPoints / 2} on checkout</div>
                  </div>
                  <p className="rewards-perk-desc">
                    You earn 10 Points for every ₹100 spent on Saaryans Heritage silk sarees. Redeem points directly on payment.
                  </p>
                </div>

                <h2 className="coupons-section-heading">Available Promo Coupons</h2>
                <div className="coupons-grid">
                  {[
                    { code: 'SAARYANS10', desc: 'Get 10% instant discount on all luxury sarees', min: 'No min. cart value' },
                    { code: 'FIRST50', desc: 'Flat ₹500 discount on your festive collection purchase', min: 'Min. order ₹1,500' },
                    { code: 'FESTIVE20', desc: 'Get 20% discount on orders above ₹2,000', min: 'Min. order ₹2,000' },
                  ].map((coupon) => (
                    <div key={coupon.code} className="coupon-ticket-card">
                      <div className="coupon-ticket-left">
                        <span className="ticket-code">{coupon.code}</span>
                        <p className="ticket-desc">{coupon.desc}</p>
                        <span className="ticket-min">{coupon.min}</span>
                      </div>
                      <button
                        className="ticket-copy-btn"
                        onClick={() => {
                          navigator.clipboard?.writeText(coupon.code);
                          showToast(`Code "${coupon.code}" copied to clipboard!`, 'success');
                        }}
                      >
                        COPY CODE
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Return Request Modal */}
      <ReturnModal
        order={returnOrder}
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        onConfirm={handleConfirmReturn}
      />

      {/* Add / Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="address-modal" role="dialog" aria-modal="true" aria-label="Address Form">
          <div className="address-modal__backdrop" onClick={() => setIsAddressModalOpen(false)} />
          <div className="address-modal__dialog">
            <button className="address-modal__close" onClick={() => setIsAddressModalOpen(false)}>
              <CloseIcon size={22} />
            </button>
            <h2 className="address-modal__title">{editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}</h2>

            <form onSubmit={handleSaveAddress} className="address-modal__form">
              <div className="form-group-row">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>10-Digit Mobile *</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={addressForm.mobile}
                    onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Locality / Area *</label>
                  <input
                    type="text"
                    value={addressForm.locality}
                    onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Flat / House No. / Building *</label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-field">
                  <label>City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>State *</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Address Type</label>
                <div className="address-type-selector">
                  {['Home', 'Office'].map((t) => (
                    <label key={t} className="address-type-option">
                      <input
                        type="radio"
                        name="addrModalType"
                        value={t}
                        checked={addressForm.type === t}
                        onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="checkbox-default-label">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                />
                <span>Make this my default delivery address</span>
              </label>

              <div className="address-modal__actions">
                <Button type="button" variant="outlined" size="md" onClick={() => setIsAddressModalOpen(false)}>
                  CANCEL
                </Button>
                <Button type="submit" variant="primary" size="md">
                  SAVE ADDRESS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Account;
