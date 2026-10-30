import crypto from 'crypto';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const OTP_STORE = new Map();
const OTP_PATTERN = /^\d{6}$/;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

export const normaliseIndianPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  const nationalNumber = digits.length === 10 ? digits : digits.replace(/^91/, '');
  return nationalNumber.length === 10 ? `+91${nationalNumber}` : null;
};

export const createSessionToken = ({ uid, phoneNumber }) => {
  if (!config.auth.tokenSecret) throw new Error('AUTH_TOKEN_SECRET is not configured');
  const payload = Buffer.from(JSON.stringify({ uid, phoneNumber, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', config.auth.tokenSecret).update(payload).digest('base64url');
  return `wa.${payload}.${signature}`;
};

export const verifySessionToken = (token) => {
  const [kind, payload, signature] = String(token || '').split('.');
  if (kind !== 'wa' || !payload || !signature || !config.auth.tokenSecret) return null;
  const expected = crypto.createHmac('sha256', config.auth.tokenSecret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() && data.uid && data.phoneNumber ? data : null;
  } catch { return null; }
};

export const sendOtp = async (phoneNumber) => {
  const { accessToken, phoneNumberId, templateName, templateLanguageCode, templateHasBodyParameter, templateUrlButtonIndex, graphApiVersion } = config.whatsapp;
  if (!accessToken || !phoneNumberId || !templateName) throw new Error('WhatsApp OTP is not configured on the server.');
  for (const [id, record] of OTP_STORE) if (record.expiresAt <= Date.now()) OTP_STORE.delete(id);
  const otp = crypto.randomInt(100000, 1000000).toString();
  const requestId = crypto.randomUUID();
  const components = templateHasBodyParameter ? [{ type: 'body', parameters: [{ type: 'text', text: otp }] }] : [];
  if (Number.isInteger(templateUrlButtonIndex) && templateUrlButtonIndex >= 0) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: String(templateUrlButtonIndex),
      parameters: [{ type: 'text', text: otp }]
    });
  }
  const response = await fetch(`https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`, {
    method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: phoneNumber.slice(1), type: 'template', template: { name: templateName, language: { code: templateLanguageCode }, ...(components.length ? { components } : {}) } })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    logger.error('WhatsApp OTP send failed:', result?.error?.message || response.statusText);
    throw new Error('Unable to send WhatsApp OTP. Please try again shortly.');
  }
  OTP_STORE.set(requestId, { phoneNumber, otpHash: hashOtp(otp), expiresAt: Date.now() + config.auth.otpTtlMs, attempts: 0 });
  return { requestId, expiresInSeconds: Math.floor(config.auth.otpTtlMs / 1000) };
};

export const verifyOtp = (requestId, otp) => {
  const record = OTP_STORE.get(requestId);
  if (!record || record.expiresAt <= Date.now()) { OTP_STORE.delete(requestId); throw new Error('This OTP has expired. Please request a new one.'); }
  if (record.attempts >= config.auth.otpMaxAttempts) { OTP_STORE.delete(requestId); throw new Error('Too many incorrect attempts. Please request a new OTP.'); }
  record.attempts += 1;
  if (!OTP_PATTERN.test(String(otp)) || !crypto.timingSafeEqual(Buffer.from(record.otpHash), Buffer.from(hashOtp(String(otp))))) {
    OTP_STORE.set(requestId, record); throw new Error('The OTP is incorrect. Please try again.');
  }
  OTP_STORE.delete(requestId);
  return record.phoneNumber;
};

export const verifyWebhookSignature = (rawBody, signature) => {
  // Never accept unsigned webhooks in production.
  if (!config.whatsapp.appSecret) return !config.isProduction;
  if (!rawBody || typeof signature !== 'string') return false;
  const expected = `sha256=${crypto.createHmac('sha256', config.whatsapp.appSecret).update(rawBody).digest('hex')}`;
  return typeof signature === 'string' && signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
