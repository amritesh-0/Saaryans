import { createContext, useContext, useState, useEffect } from 'react';
import productRed from '../assets/images/product-red-saree.jpg';
import productGreen from '../assets/images/product-green-saree.jpg';
import productPurple from '../assets/images/product-purple-saree.jpg';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'usr_88291',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  phone: '+91 98765 43210',
  gender: 'Female',
  dob: '1995-08-15',
  avatar: 'P',
  membershipTier: 'Royal Gold Member',
  rewardPoints: 1250,
  joinedDate: 'October 2023',
};

const INITIAL_ORDERS = [
  {
    id: 'SAR-942851',
    date: '28 Aug 2026',
    status: 'In Transit',
    stepIndex: 2, // 0: Placed, 1: Shipped, 2: Out for Delivery, 3: Delivered
    estimatedDelivery: '30 Aug 2026',
    total: 1000,
    paymentMethod: 'UPI (Google Pay)',
    shippingAddress: {
      fullName: 'Priya Sharma',
      address: 'Flat 402, Royal Palms Residency',
      locality: 'SG Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      mobile: '9876543210',
    },
    items: [
      {
        id: 1,
        name: 'Red Banarasi Georgette Saree With Bandhani Weave',
        size: 'M',
        quantity: 1,
        price: 1000,
        image: productRed,
      },
    ],
    canReturn: false,
    timeline: [
      { title: 'Order Placed', time: '28 Aug, 10:30 AM', done: true },
      { title: 'Dispatched from Surat Hub', time: '28 Aug, 04:15 PM', done: true },
      { title: 'Out for Delivery (Ahmedabad)', time: 'Today, 08:00 AM', done: true },
      { title: 'Delivered', time: 'Expected by 6 PM today', done: false },
    ],
  },
  {
    id: 'SAR-892140',
    date: '14 Aug 2026',
    status: 'Delivered',
    stepIndex: 3,
    deliveredOn: '17 Aug 2026',
    total: 1200,
    paymentMethod: 'Credit Card (**** 4829)',
    shippingAddress: {
      fullName: 'Priya Sharma',
      address: 'Flat 402, Royal Palms Residency',
      locality: 'SG Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      mobile: '9876543210',
    },
    items: [
      {
        id: 2,
        name: 'Lime Green Kanjivaram Silk Saree With Golden Border',
        size: 'L',
        quantity: 1,
        price: 1200,
        image: productGreen,
      },
    ],
    canReturn: true,
    returnStatus: null,
    timeline: [
      { title: 'Order Placed', time: '14 Aug, 02:10 PM', done: true },
      { title: 'Dispatched from Varanasi Hub', time: '15 Aug, 11:00 AM', done: true },
      { title: 'Out for Delivery', time: '17 Aug, 09:30 AM', done: true },
      { title: 'Delivered Successfully', time: '17 Aug, 01:45 PM', done: true },
    ],
  },
  {
    id: 'SAR-761230',
    date: '02 Jul 2026',
    status: 'Returned & Refunded',
    stepIndex: 3,
    total: 1500,
    paymentMethod: 'Net Banking (HDFC)',
    shippingAddress: {
      fullName: 'Priya Sharma',
      address: '4th Floor, Titanium City Center',
      locality: 'Prahlad Nagar',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      mobile: '9876543210',
    },
    items: [
      {
        id: 3,
        name: 'Purple Satin Gaji Silk Saree With Floral Embroidery',
        size: 'S',
        quantity: 1,
        price: 1500,
        image: productPurple,
      },
    ],
    canReturn: false,
    returnStatus: 'Refund Credited of ₹1,500 via HDFC on 07 Jul 2026',
    timeline: [
      { title: 'Order Placed', time: '02 Jul', done: true },
      { title: 'Delivered', time: '05 Jul', done: true },
      { title: 'Return Pickup Completed', time: '06 Jul', done: true },
      { title: 'Refund Completed', time: '07 Jul', done: true },
    ],
  },
];

const INITIAL_ADDRESSES = [
  {
    id: 'addr_1',
    fullName: 'Priya Sharma',
    mobile: '9876543210',
    pincode: '380015',
    address: 'Flat 402, Royal Palms Residency',
    locality: 'SG Highway, Bodakdev',
    city: 'Ahmedabad',
    state: 'Gujarat',
    type: 'Home',
    isDefault: true,
  },
  {
    id: 'addr_2',
    fullName: 'Priya Sharma (Office)',
    mobile: '9876543210',
    pincode: '380015',
    address: '4th Floor, Titanium City Center',
    locality: 'Prahlad Nagar',
    city: 'Ahmedabad',
    state: 'Gujarat',
    type: 'Office',
    isDefault: false,
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('saaryans-user');
      return saved ? JSON.parse(saved) : DEMO_USER; // Default logged in with demo user for seamless UX
    } catch {
      return DEMO_USER;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('saaryans-orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('saaryans-addresses');
      return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
    } catch {
      return INITIAL_ADDRESSES;
    }
  });

  useEffect(() => {
    localStorage.setItem('saaryans-user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('saaryans-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('saaryans-addresses', JSON.stringify(addresses));
  }, [addresses]);

  const login = (email, password) => {
    setUser({
      ...DEMO_USER,
      email: email || DEMO_USER.email,
    });
    return true;
  };

  const demoLogin = () => {
    setUser(DEMO_USER);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  const addAddress = (newAddr) => {
    const id = `addr_${Date.now()}`;
    const formatted = {
      ...newAddr,
      id,
      isDefault: addresses.length === 0 || newAddr.isDefault,
    };
    if (formatted.isDefault) {
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: false })).concat(formatted));
    } else {
      setAddresses((prev) => [...prev, formatted]);
    }
  };

  const updateAddress = (id, updatedAddr) => {
    setAddresses((prev) =>
      prev.map((addr) => {
        if (addr.id === id) {
          return { ...addr, ...updatedAddr };
        }
        if (updatedAddr.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      })
    );
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const requestReturn = (orderId, reason, returnType = 'Refund to Bank') => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'Return Requested',
            canReturn: false,
            returnStatus: `Return requested (${reason}). Pickup scheduled in 24-48 hrs.`,
          };
        }
        return order;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        orders,
        addresses,
        login,
        demoLogin,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        requestReturn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
