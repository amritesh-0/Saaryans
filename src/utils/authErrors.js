/**
 * Saaryans Authentication Error Formatter
 * Converts raw Firebase Auth error codes and strings into polished, user-friendly messages.
 * Prevents raw technical error codes like "Firebase: Error (auth/invalid-verification-code)."
 * from ever being shown in the UI.
 */

export function formatAuthError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';

  const code = err.code || '';
  const message = typeof err === 'string' ? err : (err.message || '');

  // 1. Specific Firebase Auth Error Codes
  switch (code) {
    case 'auth/invalid-verification-code':
      return 'The OTP you entered is incorrect. Please check the 6-digit code and try again.';
    case 'auth/code-expired':
      return 'This verification code has expired. Please click "Resend OTP" to get a new code.';
    case 'auth/missing-verification-code':
      return 'Please enter the complete 6-digit verification code.';
    case 'auth/invalid-verification-id':
    case 'auth/session-expired':
      return 'Your verification session has expired. Please request a new OTP.';
    case 'auth/invalid-phone-number':
      return 'Please enter a valid 10-digit mobile number.';
    case 'auth/missing-phone-number':
      return 'Please enter your 10-digit mobile number.';
    case 'auth/quota-exceeded':
      return 'SMS verification limit reached. Please try again in a little while.';
    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait 1–2 minutes before trying again.';
    case 'auth/captcha-check-failed':
      return 'Security verification was closed or timed out. Please tap GET OTP to retry.';
    case 'auth/invalid-app-credential':
      return 'Security verification could not be validated. Complete the reCAPTCHA check and try again.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact customer support.';
    case 'auth/operation-not-allowed':
      return 'Phone authentication is currently unavailable. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Verification window was closed. Please try again.';
    case 'auth/billing-not-enabled':
      return 'SMS service is temporarily unavailable. Please try again later.';
    default:
      break;
  }

  // 2. Parse inline "(auth/...)" error codes if code property wasn't set
  const authMatch = message.match(/\(auth\/([a-z0-9-]+)\)/i);
  if (authMatch && authMatch[1]) {
    const extracted = `auth/${authMatch[1]}`;
    switch (extracted) {
      case 'auth/invalid-verification-code':
        return 'The OTP you entered is incorrect. Please check the 6-digit code and try again.';
      case 'auth/code-expired':
        return 'This verification code has expired. Please click "Resend OTP" to get a new code.';
      case 'auth/invalid-phone-number':
        return 'Please enter a valid 10-digit mobile number.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait 1–2 minutes before trying again.';
      case 'auth/quota-exceeded':
        return 'SMS limit reached. Please try again later.';
      case 'auth/captcha-check-failed':
        return 'Security check timed out or failed. Please try again.';
      case 'auth/invalid-app-credential':
        return 'Security verification could not be validated. Complete the reCAPTCHA check and try again.';
      default: {
        const friendly = authMatch[1].replace(/-/g, ' ');
        return `Verification could not be completed (${friendly}). Please try again.`;
      }
    }
  }

  // 3. Clean up technical prefixes like "Firebase: Error" or "Error:"
  let clean = message
    .replace(/^firebase:\s*error\s*/i, '')
    .replace(/^firebase:\s*/i, '')
    .replace(/^error:\s*/i, '')
    .trim();

  if (!clean || clean.length < 3) {
    return 'Authentication could not be completed. Please try again.';
  }

  // Capitalize first letter and ensure ending period
  clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (!clean.endsWith('.') && !clean.endsWith('!')) {
    clean += '.';
  }

  return clean;
}
