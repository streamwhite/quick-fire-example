'use client';
import { TotpSecret, User } from 'firebase/auth';
import QRCode from 'qrcode';
import {
  enrollMfaWithPhone,
  enrollWfaWithTotp,
  generateTotpSecret,
  sendEmailVerification,
  sendMfaPhoneEnrollmentCode,
  watchAuth,
} from 'quick-fire-auth';
import { useEffect, useRef, useState } from 'react';
import { auth } from '../_lib/auth';
import {
  checkMfaEnrollmentStatus,
  getMfaStatusColor,
  getMfaStatusText,
} from '../_lib/mfa-utils';

export default function SignUp() {
  const [user, setUser] = useState<User | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  // phone number
  const [isEnrollStarted, setIsEnrollStarted] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  // totp
  const [isTotpEnrollStarted, setIsTotpEnrollStarted] = useState(false);
  const [hasMfaEnrolled, setHasMfaEnrolled] = useState(false);

  // ref to secret
  const secretRef = useRef<TotpSecret | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [isTotpEnrolled, setIsTotpEnrolled] = useState(false);
  const [totpSecret, setTotpSecret] = useState<string>('');

  useEffect(() => {
    const unsubscribe = watchAuth({
      handleUser: (user) => {
        if (user) {
          setUser(user);
          const isEnrolled = checkMfaEnrollmentStatus(user);
          setHasMfaEnrolled(isEnrolled);
        } else {
          setUser(null);
          setHasMfaEnrolled(false);
        }
      },
      auth,
    });
    return () => unsubscribe();
  }, []);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
  };

  const verifyCode = () => {
    enrollMfaWithPhone({
      verificationCode: mfaCode,
      user: user!,
    }).then(() => {
      setIsEnrolled(true);
      setHasMfaEnrolled(true);
    });
  };

  const handleUri = async (uri: string) => {
    const qrcode = document.getElementById('qrcode');
    try {
      await QRCode.toCanvas(qrcode, uri);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendEmailVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification({
          user,
          auth,
          locale: 'en',
        });
        setIsEmailVerificationSent(true);
      } catch (error) {
        console.error('Error sending verification email:', error);
      }
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      <h1>this is mfa test page</h1>

      {/* Sign-in check */}
      {!user && (
        <div className='mt-4 p-4 bg-red-100 border border-red-400 rounded-md max-w-md'>
          <p
            className='text-red-800 text-center'
            data-testid='mfa-signin-required'
          >
            Please sign in first to access Multi-Factor Authentication settings.
          </p>
        </div>
      )}

      {/* Email verification check */}
      {user && !user.emailVerified && (
        <div className='mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md max-w-md'>
          <p
            className='text-yellow-800 text-center mb-3'
            data-testid='mfa-email-verification-required'
          >
            Please verify your email address first before setting up
            Multi-Factor Authentication.
          </p>
          <button
            onClick={handleSendEmailVerification}
            className='w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
            data-testid='mfa-send-verification-email'
          >
            Send Verification Email
          </button>
          {isEmailVerificationSent && (
            <p className='text-green-600 text-sm mt-2 text-center'>
              Verification email sent! Please check your inbox.
            </p>
          )}
        </div>
      )}

      {/* Local development notice */}
      {user && user.emailVerified && (
        <div className='mt-4 p-4 bg-blue-100 border border-blue-400 rounded-md max-w-md'>
          <p
            className='text-blue-800 text-center text-sm'
            data-testid='mfa-localhost-notice'
          >
            📝 Note: For local development for firebase restrictions, use
            127.0.0.1 instead of localhost
          </p>
        </div>
      )}

      {/* Phone number format notice */}
      {user && user.emailVerified && (
        <div className='mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md max-w-md'>
          <p
            className='text-yellow-800 text-center text-sm'
            data-testid='mfa-phone-format-notice'
          >
            📱 Phone Number Format: Add &apos;+&lt;country code&gt;&apos; before
            the number (e.g., +1234567890)
          </p>
        </div>
      )}

      {/* Recent login requirement notice */}
      {user && user.emailVerified && (
        <div className='mt-4 p-4 bg-orange-100 border border-orange-400 rounded-md max-w-md'>
          <p
            className='text-orange-800 text-center text-sm'
            data-testid='mfa-recent-login-notice'
          >
            ⚠️ Recent Login Required: You need to have logged in recently to
            enroll in MFA
          </p>
        </div>
      )}

      {/* Testing notice */}
      {user && user.emailVerified && (
        <div className='mt-4 p-4 bg-purple-100 border border-purple-400 rounded-md max-w-md'>
          <p
            className='text-purple-800 text-center text-sm'
            data-testid='mfa-testing-notice'
          >
            🧪 Testing Notice: Add phone numbers for testing in Firebase
            console. according to feedback phone number in china may not receive
            codes during MFA enrollment in development.
          </p>
        </div>
      )}

      {user && (
        <div className='mb-4 text-center'>
          <p
            className='text-lg font-semibold text-green-600'
            data-testid='mfa-signed-in'
          >
            {user?.uid}
          </p>
          {hasMfaEnrolled && (
            <p
              className={`text-sm font-medium ${getMfaStatusColor(
                hasMfaEnrolled
              )}`}
              data-testid='mfa-enrollment-status'
            >
              MFA Status: {getMfaStatusText(hasMfaEnrolled)}
            </p>
          )}
        </div>
      )}
      {user && (
        <div className='flex flex-col items-center'>
          <button
            onClick={() => setIsEnrollStarted(true)}
            className={`mb-4 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600`}
            disabled={false}
            data-testid='start-enrollment'
          >
            start phone 2FA enrollment
          </button>
          {isEnrollStarted && (
            <>
              <input
                type='text'
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder='Phone Number'
                className='mb-4 px-4 py-2 border rounded'
                data-testid='mfa-phone-number'
                autoComplete='on'
              />
              {isCodeSent && (
                <input
                  type='text'
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder='mfa code'
                  className='mb-4 px-4 py-2 border rounded'
                  data-testid='mfa-code'
                />
              )}
              <button
                onClick={() => {
                  sendMfaPhoneEnrollmentCode({
                    phoneNumber: phoneNumber,
                    recaptchaContainerId: 'recaptcha',
                    auth,
                    user,
                  }).then(() => {
                    console.log('isCodeSent:', 'yes');
                    setIsCodeSent(true);
                  });
                }}
                className='px-4 py-2 bg-green-500 text-white rounded mb-4'
                data-testid='mfa-enroll'
              >
                send enroll code
              </button>
              <button
                onClick={verifyCode}
                className='px-4 py-2 bg-yellow-500 text-white rounded'
                data-testid='verify-enrollment'
              >
                enroll user
              </button>
              {isEnrolled && (
                <p
                  className='text-green-600 text-lg font-semibold'
                  data-testid='mfa-enrolled'
                >
                  user enrolled
                </p>
              )}
            </>
          )}

          <button
            onClick={() => setIsTotpEnrollStarted(true)}
            className={`px-4 py-2 rounded mb-2 bg-blue-500 text-white hover:bg-blue-600`}
            disabled={false}
            data-testid='start-totp-enrollment'
          >
            start totp enrollment
          </button>
          {isTotpEnrollStarted && (
            <button
              onClick={() => {
                generateTotpSecret({ user, youAppName: 'e2e-nextjs' }).then(
                  (secretInfo) => {
                    const { qrCodeUri, secret } = secretInfo;
                    secretRef.current = secret;
                    // Try to extract the actual secret string from the TotpSecret object
                    const secretObj = secret as unknown as Record<
                      string,
                      unknown
                    >;
                    const secretString =
                      (secretObj?.secret as string) ||
                      (secretObj?.key as string) ||
                      (secretObj?.value as string) ||
                      '';
                    console.log('Secret object:', secretObj);
                    console.log('Extracted secret string:', secretString);
                    setTotpSecret(secretString);
                    handleUri(qrCodeUri);
                  }
                );
              }}
              className='px-4 py-2 bg-green-500 text-white rounded'
              data-testid='totp-enroll'
            >
              get qr code
            </button>
          )}
          <canvas id='qrcode'></canvas>
          {isTotpEnrollStarted && (
            <div>
              <input
                type='text'
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder='totp code'
                className='mb-4 px-4 py-2 border rounded'
                data-testid='totp-enroll-code'
              />
              <button
                onClick={() => {
                  enrollWfaWithTotp({
                    user,
                    secret: secretRef.current!,
                    verificationCode: totpCode,
                  }).then(() => {
                    setIsEnrolled(true);
                    setHasMfaEnrolled(true);
                    setIsTotpEnrolled(true);
                  });
                }}
                className='px-4 py-2 bg-yellow-500 text-white rounded'
                data-testid='verify-mfa-code-button'
              >
                enroll user
              </button>
            </div>
          )}

          {/* TOTP Enrollment Success Notice */}
          {isTotpEnrolled && (
            <div className='mt-6 p-4 bg-green-100 border border-green-400 rounded-md'>
              <h3
                className='text-lg font-semibold text-green-800 mb-2'
                data-testid='totp-enrollment-success-title'
              >
                ✓ TOTP Successfully Enrolled!
              </h3>
              <p
                className='text-green-700 mb-3'
                data-testid='totp-enrollment-success-message'
              >
                Your TOTP (Time-based One-Time Password) has been successfully
                enrolled. You can now use your authenticator app to generate
                codes for two-factor authentication.
              </p>
              {totpSecret &&
                typeof totpSecret === 'string' &&
                totpSecret.trim() !== '' &&
                totpSecret !== '[object Object]' && (
                  <div className='bg-green-50 border border-green-300 rounded p-3'>
                    <p className='text-sm font-medium text-green-800 mb-2'>
                      Your TOTP Secret Key:
                    </p>
                    <div
                      className='bg-white border border-green-200 rounded p-2 font-mono text-sm break-all'
                      data-testid='totp-secret-display'
                    >
                      {totpSecret}
                    </div>
                    <p className='text-xs text-green-600 mt-2'>
                      ⚠️ Keep this secret key safe! Store it in a secure
                      location as a backup.
                    </p>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      <div id='recaptcha'></div>
    </div>
  );
}
