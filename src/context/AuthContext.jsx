import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  verifyPhoneUser,
  completeProfile as completeProfileApi,
  fetchOrders as fetchOrdersApi,
} from '../services/api';
import { formatAuthError } from '../utils/authErrors';
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

  const [firebaseUser, setFirebaseUser] = useState(null);
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

  // ─── Firebase Auth Listener ───────────────────────────────────────────────

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const idToken = await fbUser.getIdToken();
          setAuthToken(idToken);

          // Sync profile from backend
          const data = await verifyPhoneUser(idToken);
          if (data && !data.isNewUser && data.user) {
            const u = data.user;
            setUser({
              uid: u.uid || fbUser.uid,
              name: u.fullName,
              phone: u.phoneNumber || fbUser.phoneNumber || '',
              email: u.email || '',
              avatar: u.avatar || u.fullName?.charAt(0).toUpperCase() || 'U',
              membershipTier: u.membershipTier || 'Silver Member',
              rewardPoints: Number(u.rewardPoints || 100),
              joinedDate: u.joinedDate || '',
            });
          }

          // Load real orders
          refreshOrders();
        } catch (err) {
          console.warn('[AuthContext] onAuthStateChanged backend sync failed:', err.message);
        }
      } else {
        setFirebaseUser(null);
        // Don't wipe the session if user navigated away without explicit logout
        if (!localStorage.getItem('saaryans-user')) {
          setAuthToken(null);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [refreshOrders]);

  // ─── reCAPTCHA ────────────────────────────────────────────────────────────

  /**
   * Safely clears any active reCAPTCHA instance and removes old container elements from DOM.
   * This completely prevents the "reCAPTCHA has already been rendered in this element" error.
   */
  const cleanupRecaptcha = useCallback((containerId = 'recaptcha-container') => {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (err) {
        console.warn('Could not clear window.recaptchaVerifier:', err);
      }
      window.recaptchaVerifier = null;
    }

    // Safely remove any existing DOM container so grecaptcha cannot find it in its rendered elements cache
    const existingContainer = document.getElementById(containerId);
    if (existingContainer) {
      try {
        existingContainer.remove();
      } catch {
        existingContainer.innerHTML = '';
      }
    }
  }, []);

  /**
   * Sets up a pristine, brand-new RecaptchaVerifier instance with a clean DOM element.
   */
  const setupRecaptcha = useCallback((containerId = 'recaptcha-container') => {
    if (!auth) return null;

    // 1. Clear any existing verifier and old container
    cleanupRecaptcha(containerId);

    // 2. Dynamically create a brand-new container on document.body
    // Because this is a new element object in memory, grecaptcha has NEVER rendered into it!
    const container = document.createElement('div');
    container.id = containerId;
    container.setAttribute('data-recaptcha-managed', 'true');
    container.style.position = 'fixed';
    container.style.bottom = '0';
    container.style.right = '0';
    container.style.zIndex = '-1';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    // 3. Initialize fresh RecaptchaVerifier
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          console.warn('reCAPTCHA expired — resetting.');
          cleanupRecaptcha(containerId);
        },
      });

      return window.recaptchaVerifier;
    } catch (err) {
      console.warn('Could not initialise reCAPTCHA:', err);
      cleanupRecaptcha(containerId);
      return null;
    }
  }, [cleanupRecaptcha]);

  // ─── Auth Actions ─────────────────────────────────────────────────────────

  /**
   * Step 1: Send OTP via Firebase Phone Auth
   */
  const sendPhoneOtp = useCallback(async (phoneNumber, containerId = 'recaptcha-container') => {
    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    const formatted = `+91${clean}`;

    if (isFirebaseConfigured && auth) {
      try {
        const verifier = setupRecaptcha(containerId);
        if (!verifier) {
          throw new Error('Security check could not be initialized. Please refresh the page and try again.');
        }

        const confirmationResult = await signInWithPhoneNumber(auth, formatted, verifier);
        return { success: true, confirmationResult, phoneNumber: formatted };
      } catch (err) {
        console.error('Firebase signInWithPhoneNumber error:', err);
        // Always clean up on error so subsequent attempts start fresh
        cleanupRecaptcha(containerId);

        const friendlyMessage = formatAuthError(err);
        const enhancedError = new Error(friendlyMessage);
        enhancedError.code = err.code;
        throw enhancedError;
      }
    }

    // Should not reach here with real credentials — kept as emergency safety net
    throw new Error('Firebase Phone Auth is not configured. Check your .env file.');
  }, [cleanupRecaptcha, setupRecaptcha]);

  /**
   * Step 2: Verify OTP — returns { isNewUser, user }
   */
  const verifyPhoneOtp = useCallback(async (confirmationResult, otpCode, phoneNumber) => {
    if (!confirmationResult || !confirmationResult.confirm) {
      throw new Error('Verification session not found. Please request a new OTP.');
    }

    try {
      const result = await confirmationResult.confirm(otpCode);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      setAuthToken(idToken);
      setFirebaseUser(fbUser);

      // Verify user in backend Firestore
      let data = null;
      try {
        data = await verifyPhoneUser(idToken);
      } catch (backendErr) {
        console.warn('Backend verifyPhoneUser warning:', backendErr.message);
        data = { isNewUser: true, user: { uid: fbUser.uid, phoneNumber } };
      }

      if (data && !data.isNewUser && data.user?.fullName) {
        const u = data.user;
        const loggedInUser = {
          uid: u.uid || fbUser.uid,
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
        localStorage.setItem('saaryans-token', idToken);
        refreshOrders();
        return { isNewUser: false, user: loggedInUser };
      }

      return { isNewUser: true, user: { uid: fbUser.uid, phone: phoneNumber } };
    } catch (err) {
      console.error('Firebase confirm OTP error:', err);
      const friendlyMessage = formatAuthError(err);
      const enhancedError = new Error(friendlyMessage);
      enhancedError.code = err.code;
      throw enhancedError;
    }
  }, [refreshOrders]);

  /**
   * Step 3: First-time user — save full name and complete registration
   */
  const completeUserProfile = useCallback(async (fullName, phoneNumber) => {
    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Please enter your full name (minimum 2 characters)');
    }

    const trimmedName = fullName.trim();
    const currentToken = authToken || (auth?.currentUser ? await auth.currentUser.getIdToken() : null);
    if (!currentToken) {
      throw new Error('Session expired. Please sign in again.');
    }

    try {
      const data = await completeProfileApi(currentToken, trimmedName);
      const u = data?.user || {};
      const completedUser = {
        uid: firebaseUser?.uid || auth?.currentUser?.uid || u.uid,
        name: u.fullName || trimmedName,
        phone: u.phoneNumber || phoneNumber || firebaseUser?.phoneNumber || '',
        email: u.email || '',
        avatar: (u.fullName || trimmedName).charAt(0).toUpperCase(),
        membershipTier: u.membershipTier || 'Silver Member',
        rewardPoints: Number(u.rewardPoints || 100),
        joinedDate: u.joinedDate || '',
      };

      if (auth?.currentUser) {
        updateFirebaseProfile(auth.currentUser, { displayName: trimmedName }).catch(() => {});
      }

      setUser(completedUser);
      localStorage.setItem('saaryans-user', JSON.stringify(completedUser));
      localStorage.setItem('saaryans-token', currentToken);
      refreshOrders();
      return completedUser;
    } catch (err) {
      console.error('completeUserProfile error:', err);
      const friendlyMessage = formatAuthError(err);
      const enhancedError = new Error(friendlyMessage);
      enhancedError.code = err.code;
      throw enhancedError;
    }
  }, [authToken, firebaseUser, refreshOrders]);

  /**
   * Logout — sign out of Firebase and wipe local state
   */
  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign-out error:', err);
    }
    setUser(null);
    setFirebaseUser(null);
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
        cleanupRecaptcha,
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
