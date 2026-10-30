import { db, isInitialized } from '../config/firebase.js';
import logger from '../utils/logger.js';
import { PRODUCTS } from '../routes/productRoutes.js';
import { calculateCouponDiscount } from '../routes/couponRoutes.js';
import { sendOrderWhatsAppNotification } from './whatsappNotificationService.js';

// In-memory store for dev mode / testing when Firebase Admin is not connected
const devOrdersStore = new Map();

// Seed dev orders matching existing demo data
const SEED_ORDERS = [
  {
    id: 'SAR-942851',
    orderId: 'SAR-942851',
    userId: 'usr_default',
    userPhone: '+919876543210',
    userName: 'Priya Sharma',
    date: '28 Aug 2026',
    orderDate: '28 Aug 2026',
    status: 'In Transit',
    stepIndex: 2,
    estimatedDelivery: '30 Aug 2026',
    total: 1000,
    totalAmount: 1000,
    paymentMethod: 'UPI (Google Pay)',
    deliveryAddress: {
      fullName: 'Priya Sharma',
      address: 'Flat 402, Royal Palms Residency',
      locality: 'SG Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      mobile: '9876543210',
    },
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
        image: '/src/assets/images/product-red-saree.jpg',
      },
    ],
    canReturn: false,
    timeline: [
      { title: 'Order Placed', time: '28 Aug, 10:30 AM', done: true },
      { title: 'Dispatched from Surat Hub', time: '28 Aug, 04:15 PM', done: true },
      { title: 'Out for Delivery (Ahmedabad)', time: 'Today, 08:00 AM', done: true },
      { title: 'Delivered', time: 'Expected by 6 PM today', done: false },
    ],
    createdAt: new Date('2026-08-28T10:30:00Z').toISOString(),
  },
  {
    id: 'SAR-892140',
    orderId: 'SAR-892140',
    userId: 'usr_default',
    userPhone: '+919876543210',
    userName: 'Priya Sharma',
    date: '14 Aug 2026',
    orderDate: '14 Aug 2026',
    status: 'Delivered',
    stepIndex: 3,
    deliveredOn: '17 Aug 2026',
    estimatedDelivery: '17 Aug 2026',
    total: 1200,
    totalAmount: 1200,
    paymentMethod: 'Credit Card (**** 4829)',
    deliveryAddress: {
      fullName: 'Priya Sharma',
      address: 'Flat 402, Royal Palms Residency',
      locality: 'SG Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015',
      mobile: '9876543210',
    },
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
        image: '/src/assets/images/product-green-saree.jpg',
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
    createdAt: new Date('2026-08-14T14:10:00Z').toISOString(),
  },
];

// Initialize seed orders
for (const order of SEED_ORDERS) {
  devOrdersStore.set(order.id, order);
}

/**
 * Format date for UI display
 */
const formatDate = (date = new Date()) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// Notifications are post-commit work: an unavailable messaging provider must
// never turn a successfully placed order or return into an error for a buyer.
const queueCustomerNotification = (event, order) => {
  void sendOrderWhatsAppNotification(event, order)
    .then(async (result) => {
      const current = devOrdersStore.get(order.orderId) || order;
      const notifications = {
        ...(current.notifications || {}),
        [event]: { ...result, attemptedAt: new Date().toISOString() },
      };
      const updated = { ...current, notifications };
      devOrdersStore.set(order.orderId, updated);
      if (isInitialized && db) await db.collection('orders').doc(order.orderId).set({ notifications }, { merge: true });
    })
    .catch((error) => logger.error(`Unable to record ${event} WhatsApp notification:`, error.message));
};

/**
 * Create a new order
 */
export const createOrder = async (orderPayload, user = null) => {
  const orderId = orderPayload.orderId || `SAR-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();
  const estimatedDelivery = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const deliveryAddress = orderPayload.deliveryAddress || {};
  const requestedItems = Array.isArray(orderPayload.items) ? orderPayload.items : [];
  if (!requestedItems.length) throw new Error('Your bag is empty.');

  // Resolve prices and product details server-side. Browser totals are never
  // trusted, which prevents a client from lowering an order amount.
  const items = requestedItems.map((requested) => {
    const product = PRODUCTS.find((entry) => String(entry.id) === String(requested.id));
    if (!product) throw new Error('One or more products are no longer available.');
    const quantity = Number(requested.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error('Each item quantity must be between 1 and 10.');
    }
    if (!product.sizes.includes(requested.size)) throw new Error(`Please select a valid size for ${product.name}.`);
    return {
      id: product.id, name: product.name, price: product.price,
      originalPrice: product.originalPrice, size: requested.size, quantity,
      image: String(requested.image || '').slice(0, 500), category: product.category,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { coupon, discount: couponDiscount } = calculateCouponDiscount(orderPayload.couponCode, subtotal);
  const deliveryFee = subtotal > 0 && subtotal < 999 ? 79 : 0;
  const total = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const orderDoc = {
    id: orderId,
    orderId: orderId,
    userId: user?.uid || 'guest',
    userPhone: user?.phoneNumber || deliveryAddress.mobile || '',
    userName: user?.name || deliveryAddress.fullName || 'Valued Customer',
    items,
    total: total,
    totalAmount: total,
    itemCount: items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    deliveryAddress: deliveryAddress,
    shippingAddress: deliveryAddress,
    paymentMethod: orderPayload.paymentMethod || 'UPI',
    couponCode: coupon?.code || null,
    couponDiscount,
    deliveryFee,
    status: 'Order Confirmed',
    stepIndex: 1,
    date: formatDate(now),
    orderDate: formatDate(now),
    estimatedDelivery: formatDate(estimatedDelivery),
    canReturn: false,
    returnStatus: null,
    timeline: [
      {
        title: 'Order Placed',
        time: `${formatDate(now)}, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
        done: true,
      },
      {
        title: 'Order Confirmed & Packed',
        time: 'Processing at Surat Warehouse',
        done: true,
      },
      {
        title: 'Dispatched via Royal Express',
        time: 'Expected tomorrow',
        done: false,
      },
      {
        title: 'Delivered',
        time: `Expected by ${formatDate(estimatedDelivery)}`,
        done: false,
      },
    ],
    createdAt: now.toISOString(),
  };

  // 1. If Firestore is active, save to collection
  if (isInitialized && db) {
    try {
      await db.collection('orders').doc(orderId).set(orderDoc);

      // If registered user, also store in user orders subcollection
      if (user?.uid && user.uid !== 'guest') {
        await db
          .collection('users')
          .doc(user.uid)
          .collection('orders')
          .doc(orderId)
          .set({
            orderId,
            total,
            status: orderDoc.status,
            createdAt: orderDoc.createdAt,
          }, { merge: true });
      }

      logger.info(`Order ${orderId} saved to Firestore successfully`);
    } catch (err) {
      logger.error('Failed to write order to Firestore, falling back to cache:', err);
    }
  }

  // Always keep in memory store as fallback
  devOrdersStore.set(orderId, orderDoc);
  queueCustomerNotification('orderConfirmed', orderDoc);

  return orderDoc;
};

/**
 * Get all orders for a given user
 */
export const getOrdersByUser = async (uid, phone = null) => {
  // 1. If Firestore is active
  if (isInitialized && db && uid) {
    try {
      const snapshot = await db
        .collection('orders')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();

      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => doc.data());
      }

      // If no orders by uid, try phone
      if (phone) {
        const phoneSnapshot = await db
          .collection('orders')
          .where('userPhone', '==', phone)
          .orderBy('createdAt', 'desc')
          .get();

        if (!phoneSnapshot.empty) {
          return phoneSnapshot.docs.map((doc) => doc.data());
        }
      }
    } catch (err) {
      logger.error('Error fetching orders from Firestore:', err);
    }
  }

  // 2. Dev mode / fallback
  const userOrders = [];
  const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : null;

  for (const order of devOrdersStore.values()) {
    const orderPhone = order.userPhone ? order.userPhone.replace(/\D/g, '').slice(-10) : '';
    const isOwner =
      (uid && order.userId === uid) ||
      (cleanPhone && orderPhone === cleanPhone);

    if (isOwner) {
      userOrders.push(order);
    }
  }

  // Sort newest first
  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return userOrders;
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId, uid = null) => {
  if (isInitialized && db) {
    try {
      const doc = await db.collection('orders').doc(orderId).get();
      if (doc.exists) {
        const data = doc.data();
        if (uid && data.userId === uid) {
          return data;
        }
      }
    } catch (err) {
      logger.error('Error getting order from Firestore:', err);
    }
  }

  const cached = devOrdersStore.get(orderId);
  if (cached) {
    if (uid && cached.userId === uid) {
      return cached;
    }
  }

  return null;
};

export const requestReturn = async (orderId, uid, reason) => {
  const order = await getOrderById(orderId, uid);
  if (!order) return null;
  if (!order.canReturn || order.status !== 'Delivered') throw new Error('This order is not eligible for return.');
  const updated = {
    ...order,
    status: 'Return Requested',
    canReturn: false,
    returnStatus: `Return requested${reason ? `: ${String(reason).slice(0, 160)}` : ''}. Pickup will be scheduled within 24–48 hours.`,
    updatedAt: new Date().toISOString(),
  };
  devOrdersStore.set(orderId, updated);
  if (isInitialized && db) await db.collection('orders').doc(orderId).set(updated, { merge: true });
  queueCustomerNotification('returnCreated', updated);
  return updated;
};

/** Operational action: admin-only route marks a committed order as shipped. */
export const markOrderShipped = async (orderId, trackingNumber) => {
  let order = devOrdersStore.get(orderId) || null;
  if (isInitialized && db) {
    const doc = await db.collection('orders').doc(orderId).get();
    if (doc.exists) order = doc.data();
  }
  if (!order) return null;
  if (['Delivered', 'Return Requested', 'Returned'].includes(order.status)) {
    throw new Error('This order cannot be marked as shipped.');
  }
  const now = new Date();
  const timeline = (order.timeline || []).map((entry) =>
    entry.title.startsWith('Dispatched')
      ? { ...entry, time: `${formatDate(now)}, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, done: true }
      : entry
  );
  const updated = {
    ...order,
    status: 'Shipped',
    stepIndex: 2,
    trackingNumber: String(trackingNumber || '').trim().slice(0, 80) || 'Pending assignment',
    dispatchedAt: now.toISOString(),
    timeline,
    updatedAt: now.toISOString(),
  };
  devOrdersStore.set(orderId, updated);
  if (isInitialized && db) await db.collection('orders').doc(orderId).set(updated, { merge: true });
  queueCustomerNotification('orderShipped', updated);
  return updated;
};

export default {
  createOrder,
  getOrdersByUser,
  getOrderById,
  requestReturn,
  markOrderShipped,
};
