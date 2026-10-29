import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '../middleware/authMiddleware.js';
import { db, auth, isInitialized } from '../config/firebase.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';
import { createSessionToken, normaliseIndianPhone, sendOtp, verifyOtp, verifyWebhookSignature } from '../services/whatsappOtpService.js';

const router = Router();

// In-memory user cache for local development/testing when Firebase Admin is not yet connected
const devUsersStore = new Map();
const whatsappOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please try again in 15 minutes.' }
});

router.post('/whatsapp/send-otp', whatsappOtpLimiter, async (req, res) => {
  try {
    const phoneNumber = normaliseIndianPhone(req.body?.phoneNumber);
    if (!phoneNumber) return errorResponse(res, 'Please provide a valid 10-digit mobile number.', 400);
    const delivery = await sendOtp(phoneNumber);
    return successResponse(res, delivery, 'OTP sent on WhatsApp');
  } catch (error) {
    logger.error('WhatsApp OTP send error:', error.message);
    return errorResponse(res, error.message, 502);
  }
});

router.post('/whatsapp/verify-otp', async (req, res) => {
  try {
    const phoneNumber = verifyOtp(req.body?.requestId, req.body?.otp);
    let uid = `wa_${phoneNumber.replace(/\D/g, '')}`;
    let existingUser = null;
    if (isInitialized && db) {
      // Reuse a profile created during the previous Firebase-based login flow.
      const matches = await db.collection('users').where('phoneNumber', '==', phoneNumber).limit(1).get();
      if (!matches.empty) {
        const doc = matches.docs[0];
        uid = doc.id;
        if (doc.data()?.fullName?.trim()) existingUser = doc.data();
      }
    } else existingUser = devUsersStore.get(uid);
    const token = createSessionToken({ uid, phoneNumber });
    return successResponse(res, {
      token, isNewUser: !existingUser,
      user: existingUser ? { uid, phoneNumber: existingUser.phoneNumber || phoneNumber, fullName: existingUser.fullName, avatar: existingUser.avatar } : { uid, phoneNumber }
    }, 'OTP verified');
  } catch (error) { return errorResponse(res, error.message, 400); }
});

router.get('/whatsapp/webhook', (req, res) => {
  const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
  if (mode === 'subscribe' && config.whatsapp.webhookVerifyToken && token === config.whatsapp.webhookVerifyToken) return res.status(200).send(challenge);
  return res.sendStatus(403);
});

router.post('/whatsapp/webhook', (req, res) => {
  if (!verifyWebhookSignature(req.rawBody, req.get('X-Hub-Signature-256'))) return res.sendStatus(401);
  logger.info('WhatsApp webhook received');
  return res.sendStatus(200);
});

/**
 * POST /api/v1/auth/verify-phone-user
 * Checks if phone-authenticated user is already registered with a full name in Firestore.
 */
router.post('/verify-phone-user', verifyToken, async (req, res) => {
  try {
    const { uid, phoneNumber } = req.user;

    // 1. If Firestore is active, query the user collection
    if (isInitialized && db) {
      const userRef = db.collection('users').doc(uid);
      const doc = await userRef.get();

      if (doc.exists) {
        const data = doc.data();
        const hasFullName = Boolean(data.fullName && data.fullName.trim());

        if (hasFullName) {
          return successResponse(res, {
            isNewUser: false,
            user: {
              uid,
              phoneNumber: data.phoneNumber || phoneNumber,
              fullName: data.fullName,
              avatar: data.fullName.charAt(0).toUpperCase(),
              createdAt: data.createdAt
            }
          }, 'Existing user verified');
        }
      }

      // User document does not exist or has no name yet
      return successResponse(res, {
        isNewUser: true,
        user: {
          uid,
          phoneNumber
        }
      }, 'New user detected, full name required');
    }

    // 2. Dev mode fallback when Firebase Admin is not initialized
    const devUser = devUsersStore.get(uid);
    if (devUser && devUser.fullName && devUser.fullName.trim()) {
      return successResponse(res, {
        isNewUser: false,
        user: devUser
      }, 'Existing user verified (dev mode)');
    }

    return successResponse(res, {
      isNewUser: true,
      user: {
        uid,
        phoneNumber: phoneNumber || '+919876543210'
      }
    }, 'New user detected, full name required');

  } catch (error) {
    logger.error('Error verifying phone user:', error);
    return errorResponse(res, 'Failed to verify user registration status', 500);
  }
});

/**
 * POST /api/v1/auth/complete-profile
 * First-time user onboarding: saves full name only and completes registration.
 */
router.post('/complete-profile', verifyToken, async (req, res) => {
  try {
    const { uid, phoneNumber } = req.user;
    const { fullName } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return errorResponse(res, 'Please provide a valid full name (minimum 2 characters)', 400);
    }

    const trimmedName = fullName.trim();
    const userPayload = {
      uid,
      phoneNumber: phoneNumber || '',
      fullName: trimmedName,
      avatar: trimmedName.charAt(0).toUpperCase(),
      joinedDate: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
      membershipTier: 'Silver Member',
      rewardPoints: 100, // Welcome bonus
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // 1. If Firebase is initialized, persist to Firestore and update Auth displayName
    if (isInitialized && db) {
      const userRef = db.collection('users').doc(uid);
      const existingDoc = await userRef.get();
      
      const mergedPayload = {
        ...userPayload,
        createdAt: existingDoc.exists && existingDoc.data()?.createdAt ? existingDoc.data().createdAt : userPayload.createdAt
      };

      await userRef.set(mergedPayload, { merge: true });

      if (auth) {
        await auth.updateUser(uid, { displayName: trimmedName }).catch((err) => {
          logger.warn('Could not update Firebase displayName:', err.message);
        });
      }

      return successResponse(res, {
        user: mergedPayload
      }, 'Profile completed successfully');
    }

    // 2. Dev mode fallback
    devUsersStore.set(uid, userPayload);
    return successResponse(res, {
      user: userPayload
    }, 'Profile completed successfully (dev mode)');

  } catch (error) {
    logger.error('Error completing profile:', error);
    return errorResponse(res, 'Failed to complete profile', 500);
  }
});

/**
 * GET /api/v1/auth/me
 * Get current authenticated user details from Firestore
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const { uid, phoneNumber } = req.user;

    if (isInitialized && db) {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        return successResponse(res, {
          user: doc.data()
        }, 'User profile retrieved successfully');
      }
    }

    const devUser = devUsersStore.get(uid);
    if (devUser) {
      return successResponse(res, { user: devUser }, 'User profile retrieved');
    }

    return successResponse(res, {
      user: {
        uid,
        phoneNumber,
        fullName: req.user.name || '',
        avatar: req.user.name ? req.user.name.charAt(0).toUpperCase() : 'U'
      }
    }, 'User profile retrieved');
  } catch (error) {
    logger.error('Error fetching /me:', error);
    return errorResponse(res, 'Failed to fetch user profile', 500);
  }
});

export default router;
