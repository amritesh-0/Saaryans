import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';
import couponRoutes from './couponRoutes.js';
import { isInitialized } from '../config/firebase.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'online',
    service: 'Saaryans API',
    uptime: process.uptime(),
    firebase: {
      initialized: isInitialized
    },
    nodeEnv: process.env.NODE_ENV || 'development'
  }, 'Saaryans API is healthy and running');
});

// Sub-route registration
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);

export default router;
