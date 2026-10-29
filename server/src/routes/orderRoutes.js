import { Router } from 'express';
import { optionalAuth, verifyToken } from '../middleware/authMiddleware.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import orderService from '../services/orderService.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * POST /api/v1/orders
 * Create new order (supports logged in users and guests)
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, deliveryAddress, totalAmount, paymentMethod, couponCode, couponDiscount, deliveryFee } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'Cannot create order with an empty items list', 400);
    }

    if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.address || !deliveryAddress.pincode) {
      return errorResponse(res, 'Valid delivery address with full name, address and pincode is required', 400);
    }

    const order = await orderService.createOrder(
      {
        items,
        deliveryAddress,
        totalAmount: Number(totalAmount) || 0,
        paymentMethod: paymentMethod || 'UPI',
        couponCode,
        couponDiscount,
        deliveryFee,
      },
      req.user
    );

    logger.info(`Order placed successfully: ${order.orderId} for user ${req.user ? req.user.uid : 'guest'}`);
    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (error) {
    logger.error('Error creating order:', error);
    return errorResponse(res, error.message || 'Failed to create order', 500);
  }
});

/**
 * GET /api/v1/orders
 * Retrieve orders for current user or session
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const uid = req.user ? req.user.uid : null;
    const phone = req.user ? req.user.phoneNumber : null;

    const orders = await orderService.getOrdersByUser(uid, phone);
    return successResponse(res, orders, 'Orders retrieved successfully');
  } catch (error) {
    logger.error('Error fetching orders:', error);
    return errorResponse(res, 'Failed to retrieve orders', 500);
  }
});

/**
 * GET /api/v1/orders/:id
 * Retrieve details of a single order
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const uid = req.user ? req.user.uid : null;

    const order = await orderService.getOrderById(id, uid);
    if (!order) {
      return errorResponse(res, `Order #${id} not found`, 404);
    }

    return successResponse(res, order, 'Order details retrieved');
  } catch (error) {
    logger.error('Error retrieving order:', error);
    return errorResponse(res, 'Failed to retrieve order details', 500);
  }
});

export default router;
