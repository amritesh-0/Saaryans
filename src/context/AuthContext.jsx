import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  completeProfile as completeProfileApi,
  fetchOrders as fetchOrdersApi,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
} from '../services/api';
import productRed from '../assets/images/product-red-saree.jpg';
import productGreen from '../assets/images/product-green-saree.jpg';
import productPurple from '../assets/images/product-purple-saree.jpg';

const AuthContext = createContext(null);

/** Map image fallbacks for orders from backend that don't carry image URLs */
const IMAGE_FALLBACKS = [productRed, productGreen, productPurple];

/**
 * Normalise a raw order object from backend into the shape expected by Account.jsx
 */
const normaliseOrder = (o, idx = 0) => ({
  id: o.orderId || o.id,
  orderId: o.orderId || o.id,
  date: o.orderDate || o.date || '',
  status: o.status || 'In Transit',
  stepIndex: typeof o.stepIndex === 'number' ? o.stepIndex : 1,
  total: Number(o.total || o.totalAmount || 0),
  paymentMethod: o.paymentMethod || 'UPI',
  shippingAddress: o.shippingAddress || o.deliveryAddress || {},
  deliveryAddress: o.deliveryAddress || o.shippingAddress || {},
  estimatedDelivery: o.estimatedDelivery || '',
  items: (o.items || []).map((it, itemIdx) => ({
    id: it.id,
    name: it.name,
    size: it.size || 'Free Size',
    quantity: Number(it.quantity || 1),
    price: Number(it.price || 0),
    image: it.image || IMAGE_FALLBACKS[(idx + itemIdx) % IMAGE_FALLBACKS.length],
  })),
  canReturn: Boolean(o.canReturn),
  returnStatus: o.returnStatus || null,
  timeline: o.timeline || [
    { title: 'Order Placed', time: o.date || 'Today', done: true },
    { title: 'Order Confirmed & Packed', time: 'Processing at Hub', done: true },
    { title: 'Dispatched via Royal Express', time: 'In Progress', done: false },
    { title: 'Delivered', time: o.estimatedDelivery || 'Estimated in 3-5 days', done: false },
  ],
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('saaryans-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState(() => localStorage.getItem('saaryans-token') || null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('saaryans-addresses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ─── Persist to localStorage ───────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      localStorage.setItem('saaryans-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('saaryans-user');
    }
  }, [user]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('saaryans-token', authToken);
    } else {
      localStorage.removeItem('saaryans-token');
    }
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem('saaryans-addresses', JSON.stringify(addresses));
  }, [addresses]);

  // ─── Orders ───────────────────────────────────────────────────────────────

  /**
   * Fetch orders from backend and update state.
   * Called on mount, after login, and after order placement.
   */
  const refreshOrders = async () => {
    try {
      const raw = await fetchOrdersApi();
      if (Array.isArray(raw) && raw.length > 0) {
        setOrders(raw.map(normaliseOrder));
      }
    } catch (err) {
      // Non-fatal — keep existing orders state
      console.warn('[AuthContext] Could not refresh orders:', err.message);
    }
  };

  // Fetch on first render (picks up seed data / previous orders)
  useEffect(() => {
    refreshOrders();
  }, []);

  useEffect(() => { setAuthLoading(false); }, []);

  // ─── Auth Actions ─────────────────────────────────────────────────────────

  /**
   * Step 1: Send OTP via the server-side WhatsApp Cloud API integration.
   */
  const sendPhoneOtp = useCallback(async (phoneNumber) => {
    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    const formatted = `+91${clean}`;

    const data = await sendWhatsAppOtp(formatted);
    return { success: true, requestId: data.requestId, phoneNumber: formatted };
  }, []);

  /**
   * Step 2: Verify OTP — returns { isNewUser, user }
   */
  const verifyPhoneOtp = useCallback(async (requestId, otpCode, phoneNumber) => {
    if (!requestId) {
      throw new Error('Verification session not found. Please request a new OTP.');
    }
    const data = await verifyWhatsAppOtp(requestId, otpCode);
    setAuthToken(data.token);
    if (!data.isNewUser && data.user?.fullName) {
        const u = data.user;
        const loggedInUser = {
          uid: u.uid,
          name: u.fullName,
          phone: u.phoneNumber || phoneNumber,
          email: u.email || '',
          avatar: u.avatar || u.fullName.charAt(0).toUpperCase(),
          membershipTier: u.membershipTier || 'Silver Member',
          rewardPoints: Number(u.rewardPoints || 100),
          joinedDate: u.joinedDate || '',
        };
        setUser(loggedInUser);
        localStorage.setItem('saaryans-user', JSON.stringify(loggedInUser));
        localStorage.setItem('saaryans-token', data.token);
        refreshOrders();
        return { isNewUser: false, user: loggedInUser };
    }
    return { isNewUser: true, user: { uid: data.user.uid, phone: phoneNumber } };
  }, [refreshOrders]);

  /**
   * Step 3: First-time user — save full name and complete registration
   */
  const completeUserProfile = useCallback(async (fullName, phoneNumber) => {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Please enter your full name (minimum 2 characters)');
    }

    const trimmedName = fullName.trim();
    const currentToken = authToken;
    if (!currentToken) {
      throw new Error('Session expired. Please sign in again.');
    }

    try {
      const data = await completeProfileApi(currentToken, trimmedName);
      const u = data?.user || {};
      const completedUser = {
        uid: u.uid,
        name: u.fullName || trimmedName,
        phone: u.phoneNumber || phoneNumber || firebaseUser?.phoneNumber || '',
        email: u.email || '',
        avatar: (u.fullName || trimmedName).charAt(0).toUpperCase(),
        membershipTier: u.membershipTier || 'Silver Member',
        rewardPoints: Number(u.rewardPoints || 100),
        joinedDate: u.joinedDate || '',
      };

      setUser(completedUser);
      localStorage.setItem('saaryans-user', JSON.stringify(completedUser));
      localStorage.setItem('saaryans-token', currentToken);
      refreshOrders();
      return completedUser;
    } catch (err) {
      console.error('completeUserProfile error:', err);
      throw err;
    }
  }, [authToken, refreshOrders]);

  /**
   * Logout — sign out of Firebase and wipe local state
   */
  const logout = async () => {
    setUser(null);
    setAuthToken(null);
    setOrders([]);
    localStorage.removeItem('saaryans-user');
    localStorage.removeItem('saaryans-token');
    return true;
  };

  // ─── Profile ──────────────────────────────────────────────────────────────

  const updateProfile = (fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
      if (updated.name) updated.avatar = updated.name.charAt(0).toUpperCase();
      return updated;
    });
  };

  // ─── Addresses ────────────────────────────────────────────────────────────

  const addAddress = (newAddr) => {
    const id = `addr_${Date.now()}`;
    const formatted = { ...newAddr, id, isDefault: addresses.length === 0 || newAddr.isDefault };
    if (formatted.isDefault) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: false })).concat(formatted));
    } else {
      setAddresses((prev) => [...prev, formatted]);
    }
  };

  const updateAddress = (id, updatedAddr) => {
    setAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === id) return { ...addr, ...updatedAddr };
        if (updatedAddr.isDefault) return { ...addr, isDefault: false };
        return addr;
      })
    );
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  // ─── Returns ──────────────────────────────────────────────────────────────

  const requestReturn = (orderId, reason) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'Return Requested',
              canReturn: false,
              returnStatus: `Return requested (${reason}). Pickup scheduled in 24-48 hrs.`,
            }
          : order
      )
    );
  };

  // ─── Context Value ────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user?.name),
        authLoading,
        authToken,
        orders,
        addresses,
        sendPhoneOtp,
        verifyPhoneOtp,
        completeUserProfile,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        requestReturn,
        refreshOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
