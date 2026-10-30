import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CloseIcon, UserIcon, ChevronLeftIcon, EditIcon } from '../../../assets/icons';
import Button from '../../UI/Button/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatAuthError } from '../../../utils/authErrors';
import './LoginModal.css';

const STEP_PHONE = 'PHONE';
const STEP_OTP = 'OTP';
const STEP_NAME = 'NAME';

const LoginModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(STEP_PHONE);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpRequestId, setOtpRequestId] = useState(null);

  const otpInputRefs = useRef([]);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const prevIsOpenRef = useRef(false);

  const { sendPhoneOtp, verifyPhoneOtp, completeUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = new URLSearchParams(location.search).get('next');
  const finishLogin = () => navigate(nextPath?.startsWith('/') ? nextPath : '/account', { replace: true });

  // Reset state ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      document.body.style.overflow = 'hidden';
      setStep(STEP_PHONE);
      setPhoneNumber('');
      setOtpValues(['', '', '', '', '', '']);
      setFullName('');
      setErrorMsg('');
      setIsLoading(false);
      setOtpRequestId(null);
      setTimeout(() => phoneInputRef.current?.focus(), 150);
    } else if (!isOpen && prevIsOpenRef.current) {
      document.body.style.overflow = '';
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Safe modal close with cleanup
  const handleModalClose = () => {
    onClose();
  };

  // Safe handler to change phone number smoothly
  const handleChangeNumber = () => {
    setStep(STEP_PHONE);
    setErrorMsg('');
    setOtpValues(['', '', '', '', '', '']);
    setOtpRequestId(null);
    setCountdown(0);
    setCanResend(false);
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
        const len = phoneInputRef.current.value.length;
        phoneInputRef.current.setSelectionRange(len, len);
      }
    }, 120);
  };

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') handleModalClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer;
    if (step === STEP_OTP && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Format phone input (only digits, max 10)
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(val);
    setErrorMsg('');
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    if (phoneNumber.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(phoneNumber);
      setOtpRequestId(res.requestId);
      setStep(STEP_OTP);
      setCountdown(30);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      showToast(`OTP sent to +91 ${phoneNumber}`, 'info');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 200);
    } catch (err) {
      console.error('Error sending OTP:', err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input changes
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = cleanVal;
    setOtpValues(newOtp);
    setErrorMsg('');

    // Auto-focus next input
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (cleanVal && index === 5 && newOtp.every((digit) => digit !== '')) {
      handleVerifyOtp(null, newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otpValues];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtpValues(newOtp);
    if (pasted.length === 6) {
      handleVerifyOtp(null, pasted);
    } else {
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e, fullOtpOverride) => {
    e?.preventDefault();
    const otpToVerify = fullOtpOverride || otpValues.join('');

    if (otpToVerify.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await verifyPhoneOtp(otpRequestId, otpToVerify, `+91${phoneNumber}`);
      
      if (result.isNewUser) {
        // First-time user: ask for full name only!
        setStep(STEP_NAME);
        setTimeout(() => nameInputRef.current?.focus(), 200);
      } else {
        // Already registered user: direct to dashboard!
        showToast(`Welcome back, ${result.user.name}!`, 'success');
        handleModalClose();
        finishLogin();
      }
    } catch (err) {
      console.error('OTP Verification Error:', err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Complete profile for first-time user
  const handleCompleteProfile = async (e) => {
    e?.preventDefault();
    if (!fullName || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters)');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const completedUser = await completeUserProfile(fullName.trim(), `+91${phoneNumber}`);
      showToast(`Welcome to Saaryans, ${completedUser.name}!`, 'success');
      handleModalClose();
      finishLogin();
    } catch (err) {
      console.error('Complete Profile Error:', err);
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal" id="login-modal" role="dialog" aria-modal="true" aria-label="Sign in">
      <div className="login-modal__backdrop" onClick={handleModalClose} />
      
      <div className="login-modal__dialog">
        {step !== STEP_PHONE && (
          <button
            className="login-modal__back"
            onClick={step === STEP_OTP ? handleChangeNumber : () => setStep(STEP_OTP)}
            aria-label="Go back"
            type="button"
            title="Go back"
          >
            <ChevronLeftIcon size={20} />
          </button>
        )}

        <button
          className="login-modal__close"
          onClick={handleModalClose}
          aria-label="Close"
          type="button"
        >
          <CloseIcon size={24} />
        </button>

        {/* ========================================================
            STEP 1: ENTER PHONE NUMBER
            ======================================================== */}
        {step === STEP_PHONE && (
          <div className="login-modal__step-content">
            <div className="login-modal__header-icon">
              <span className="auth-brand-symbol">✾</span>
            </div>
            
            <h2 className="login-modal__title">Sign In / Register</h2>
            <p className="login-modal__subtitle">
              Enter your 10-digit mobile number to proceed with OTP verification
            </p>

            {errorMsg && <div className="login-modal__alert-error">{errorMsg}</div>}

            <form className="login-modal__form" onSubmit={handleSendOtp}>
              <div className="login-modal__field">
                <label className="login-modal__label" htmlFor="login-phone">Mobile Number</label>
                <div className="login-phone-wrapper">
                  <span className="login-phone-prefix">+91</span>
                  <input
                    ref={phoneInputRef}
                    id="login-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="Enter 10-digit mobile number"
                    className="login-modal__input login-phone-input"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={phoneNumber.length !== 10 || isLoading}
                id="send-otp-btn"
              >
                {isLoading ? 'SENDING OTP...' : 'GET OTP'}
              </Button>
            </form>

            <p className="login-modal__terms">
              By continuing, you agree to Saaryans' Terms of Service and Privacy Policy.
            </p>
          </div>
        )}

        {/* ========================================================
            STEP 2: ENTER OTP
            ======================================================== */}
        {step === STEP_OTP && (
          <div className="login-modal__step-content">
            <h2 className="login-modal__title">Verify OTP</h2>
            <div className="login-modal__subtitle">
              <span>We have sent a 6-digit verification code to</span>
              <div className="otp-target-row">
                <strong className="otp-target-number">+91 {phoneNumber}</strong>
                <button
                  type="button"
                  className="otp-change-number-btn"
                  onClick={handleChangeNumber}
                  title="Change phone number"
                  id="change-phone-number-btn"
                >
                  <EditIcon size={13} />
                  <span>Change</span>
                </button>
              </div>
            </div>

            {errorMsg && <div className="login-modal__alert-error">{errorMsg}</div>}

            <form className="login-modal__form" onSubmit={(e) => handleVerifyOtp(e)}>
              <div className="otp-inputs-grid" onPaste={handleOtpPaste}>
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-digit-box"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e.target.value)}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="otp-resend-row">
                {canResend ? (
                  <button
                    type="button"
                    className="otp-resend-btn"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="otp-timer-text">
                    Resend OTP in <strong>00:{countdown.toString().padStart(2, '0')}</strong>
                  </span>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={otpValues.some((d) => !d) || isLoading}
                id="verify-otp-btn"
              >
                {isLoading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
              </Button>
            </form>
          </div>
        )}

        {/* ========================================================
            STEP 3: FIRST TIME USER - ASK FOR FULL NAME ONLY
            ======================================================== */}
        {step === STEP_NAME && (
          <div className="login-modal__step-content">
            <div className="login-modal__header-icon">
              <div className="name-step-avatar-badge">
                <UserIcon size={24} />
              </div>
            </div>

            <h2 className="login-modal__title">Welcome to Saaryans!</h2>
            <p className="login-modal__subtitle">
              Please enter your full name to complete your registration.
            </p>

            {errorMsg && <div className="login-modal__alert-error">{errorMsg}</div>}

            <form className="login-modal__form" onSubmit={handleCompleteProfile}>
              <div className="login-modal__field">
                <label className="login-modal__label" htmlFor="first-time-fullname">
                  Full Name
                </label>
                <input
                  ref={nameInputRef}
                  id="first-time-fullname"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  className="login-modal__input"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrorMsg('');
                  }}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={!fullName.trim() || isLoading}
                id="complete-name-btn"
              >
                {isLoading ? 'SAVING PROFILE...' : 'GO TO DASHBOARD'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
