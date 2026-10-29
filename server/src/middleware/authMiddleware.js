import { auth, isInitialized } from '../config/firebase.js';
import { errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import { verifySessionToken } from '../services/whatsappOtpService.js';

/**
 * Middleware to verify Firebase ID Token in Authorization header
 */
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. No authentication token provided.', 401);
  }

  const token = authHeader.split('Bearer ')[1].trim();

  if (!token) {
    return errorResponse(res, 'Access denied. Malformed authentication token.', 401);
  }

  const whatsappSession = verifySessionToken(token);
  if (whatsappSession) {
    req.user = { uid: whatsappSession.uid, phoneNumber: whatsappSession.phoneNumber, name: '', role: 'customer' };
    return next();
  }

  if (!isInitialized || !auth) {
    // Development fallback if Firebase Admin credentials are not yet configured
    if (process.env.NODE_ENV !== 'production') {
      if (token.startsWith('mock_') || token.startsWith('demo_')) {
        const parts = token.split('_');
        const phone = parts[2] || '+919876543210';
        req.user = {
          uid: 'usr_' + phone.replace(/\D/g, '').slice(-10),
          phoneNumber: phone,
          name: '',
          role: 'customer'
        };
        return next();
      }

      // If token is a JWT from Firebase Client SDK, decode base64 payload in dev mode
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          req.user = {
            uid: payload.user_id || payload.sub || 'usr_client',
            phoneNumber: payload.phone_number || '',
            name: payload.name || '',
            email: payload.email || '',
            role: payload.role || 'customer',
            claims: payload
          };
          return next();
        }
      } catch (e) {
        logger.warn('Could not parse token in dev mode:', e.message);
      }
    }
    logger.warn('Auth verification requested but Firebase Admin SDK is not initialized with credentials.');
    return errorResponse(res, 'Authentication service credentials pending. Please add Firebase Admin credentials.', 503);
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      phoneNumber: decodedToken.phone_number || '',
      name: decodedToken.name || '',
      picture: decodedToken.picture || '',
      emailVerified: decodedToken.email_verified,
      role: decodedToken.role || 'customer',
      claims: decodedToken
    };
    next();
  } catch (error) {
    logger.error('Firebase token verification failed:', error.message);
    
    if (error.code === 'auth/id-token-expired') {
      return errorResponse(res, 'Authentication token has expired. Please sign in again.', 401);
    }
    
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
};

/**
 * Optional authentication middleware - attaches user if valid token exists, but does not block if missing
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    req.user = null;
    return next();
  }

  const whatsappSession = verifySessionToken(token);
  if (whatsappSession) {
    req.user = { uid: whatsappSession.uid, phoneNumber: whatsappSession.phoneNumber, name: '', role: 'customer' };
    return next();
  }

  if (!isInitialized || !auth) {
    if (process.env.NODE_ENV !== 'production') {
      if (token.startsWith('mock_') || token.startsWith('demo_')) {
        const parts = token.split('_');
        const phone = parts[2] || '+919876543210';
        req.user = {
          uid: 'usr_' + phone.replace(/\D/g, '').slice(-10),
          phoneNumber: phone,
          name: '',
          role: 'customer'
        };
        return next();
      }
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          req.user = {
            uid: payload.user_id || payload.sub || 'usr_client',
            phoneNumber: payload.phone_number || '',
            name: payload.name || '',
            role: payload.role || 'customer'
          };
          return next();
        }
      } catch {}
    }
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      phoneNumber: decodedToken.phone_number || '',
      name: decodedToken.name || '',
      picture: decodedToken.picture || '',
      role: decodedToken.role || 'customer'
    };
  } catch {
    req.user = null;
  }

  next();
};

export default {
  verifyToken,
  optionalAuth
};
