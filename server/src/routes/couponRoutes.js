import { Router } from 'express';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const router = Router();

// Official platform coupons
const COUPONS = {
  SAARYANS10: {
    code: 'SAARYANS10',
    type: 'percent',
    value: 10,
    minOrder: 0,
    label: '10% off on all orders',
    description: 'Special 10% discount across royal saree collection',
  },
  FIRST50: {
    code: 'FIRST50',
    type: 'flat',
    value: 500,
    minOrder: 0,
    label: '₹500 flat off',
    description: '₹500 welcome discount on your first order',
  },
  FESTIVE20: {
    code: 'FESTIVE20',
    type: 'percent',
    value: 20,
    minOrder: 2000,
    label: '20% off on orders above ₹2,000',
    description: 'Festive offer: 20% discount on cart value above ₹2,000',
  },
};

/**
 * GET /api/v1/coupons
 * List available promo codes
 */
router.get('/', (req, res) => {
  const list = Object.values(COUPONS).map((c) => ({
    code: c.code,
    type: c.type,
    value: c.value,
    minOrder: c.minOrder,
    label: c.label,
    description: c.description,
  }));

  return successResponse(res, list, 'Available coupons retrieved');
});

/**
 * POST /api/v1/coupons/validate
 * Validate coupon code against current subtotal
 */
router.post('/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body;

  if (!code || typeof code !== 'string') {
    return errorResponse(res, 'Please provide a coupon code', 400);
  }

  const cleanCode = code.toUpperCase().trim();
  const coupon = COUPONS[cleanCode];

  if (!coupon) {
    return errorResponse(res, 'Invalid coupon code. Try SAARYANS10, FIRST50, or FESTIVE20', 404);
  }

  const numericSubtotal = Number(subtotal) || 0;

  if (coupon.minOrder > 0 && numericSubtotal < coupon.minOrder) {
    return errorResponse(
      res,
      `Coupon '${coupon.code}' requires a minimum order of ₹${coupon.minOrder.toLocaleString()}`,
      400
    );
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.round(numericSubtotal * (coupon.value / 100));
  } else {
    discount = Math.min(coupon.value, numericSubtotal);
  }

  return successResponse(
    res,
    {
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
      label: coupon.label,
      description: coupon.description,
    },
    `Coupon applied: ${coupon.label}`
  );
});

export default router;
