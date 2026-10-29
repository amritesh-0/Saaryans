import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();

// All user routes require authentication
router.use(verifyToken);

/**
 * GET /api/v1/users/profile
 */
router.get('/profile', async (req, res) => {
  return successResponse(res, {
    uid: req.user.uid,
    email: req.user.email,
    name: req.user.name,
    picture: req.user.picture
  }, 'User profile fetched');
});

/**
 * PUT /api/v1/users/profile
 */
router.put('/profile', async (req, res) => {
  return successResponse(res, {
    uid: req.user.uid,
    updated: true,
    ...req.body
  }, 'Profile updated successfully');
});

/**
 * GET /api/v1/users/addresses
 */
router.get('/addresses', async (req, res) => {
  return successResponse(res, [], 'Addresses fetched successfully');
});

/**
 * POST /api/v1/users/addresses
 */
router.post('/addresses', async (req, res) => {
  return successResponse(res, {
    id: 'addr_' + Date.now(),
    ...req.body
  }, 'Address created successfully', 201);
});

export default router;
