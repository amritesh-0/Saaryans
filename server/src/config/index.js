import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 6000,
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '',
    projectId: process.env.FIREBASE_PROJECT_ID || 'saaryans-app',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || ''
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },
  whatsapp: {
    graphApiVersion: process.env.WHATSAPP_GRAPH_API_VERSION || 'v22.0',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    templateName: process.env.WHATSAPP_OTP_TEMPLATE_NAME || '',
    templateLanguageCode: process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE_CODE || 'en_US',
    templateHasBodyParameter: process.env.WHATSAPP_OTP_TEMPLATE_HAS_BODY_PARAMETER !== 'false',
    // Leave empty when the approved template has no dynamic URL button.
    templateUrlButtonIndex: process.env.WHATSAPP_OTP_TEMPLATE_URL_BUTTON_INDEX === undefined || process.env.WHATSAPP_OTP_TEMPLATE_URL_BUTTON_INDEX === ''
      ? null
      : Number(process.env.WHATSAPP_OTP_TEMPLATE_URL_BUTTON_INDEX),
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
    appSecret: process.env.META_APP_SECRET || ''
  },
  auth: {
    tokenSecret: process.env.AUTH_TOKEN_SECRET || '',
    otpTtlMs: parseInt(process.env.WHATSAPP_OTP_TTL_MS || '600000', 10),
    otpMaxAttempts: parseInt(process.env.WHATSAPP_OTP_MAX_ATTEMPTS || '5', 10)
  }
};

export default config;
