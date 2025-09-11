'use client';

import { MultiFactorResolver, UserCredential } from 'firebase/auth';
import {
  getMfaResolverInfo,
  sendMfaPhoneLoginCode,
  signInWithEmailLink,
  verifyMfaCode,
} from 'quick-fire-auth';
import { useEffect, useRef, useState } from 'react';
import { auth } from '../_lib/auth';

const Page = () => {
  const [userCredential, setUserCredential] = useState<UserCredential | null>(
    null
  );
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [hasTotp, setHasTotp] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [showMfaOptions, setShowMfaOptions] = useState(false);
  const [availableMfaTypes, setAvailableMfaTypes] = useState<string[]>([]);
  const currentResolver = useRef<MultiFactorResolver | null>(null);
  const mfaType = useRef<'sms' | 'totp' | null>(null);
  const userCredentialRef = useRef<UserCredential | null>(null);
  const handleMfa = ({
    types,
    resolver,
  }: {
    types: string[];
    resolver: MultiFactorResolver;
  }) => {
    console.log('handleMfa called with types:', types);
    console.log('Resolver received:', resolver);
    console.log('Resolver hints:', resolver.hints);

    currentResolver.current = resolver;

    if (types.length === 1) {
      // send code directly
      if (types[0] === 'sms') {
        sendMfaPhoneLoginCode({
          resolver,
          recaptchaContainerId: 'recaptcha',
          auth,
        }).then(() => {
          setIsCodeSent(true);
          mfaType.current = 'sms';
        });
      }
      if (types[0] === 'totp') {
        setHasTotp(true);
        mfaType.current = 'totp';
      }
    } else if (types.length >= 2) {
      // show options to user to select
      setAvailableMfaTypes(types);
      setShowMfaOptions(true);
    }
  };

  const handleOtpCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMfaCode(e.target.value);
  };

  const verifyCode = () => {
    if (currentResolver.current && mfaType.current) {
      verifyMfaCode({
        verificationCode: mfaCode || totpCode,
        multiFactorResolver: currentResolver.current,
        type: mfaType.current!,
      })
        .then((userCredential) => {
          setUserCredential(userCredential as UserCredential);
        })
        .catch((error) => {
          console.error('verify code error:', error);
        });
    }
  };

  const handleMfaMethodSelection = (method: 'sms' | 'totp') => {
    setShowMfaOptions(false);
    mfaType.current = method;

    if (method === 'sms') {
      if (!currentResolver.current) {
        console.error('No resolver available for SMS 2FA');
        return;
      }

      // Ensure recaptcha container is visible and ready
      const recaptchaElement = document.getElementById('recaptcha');
      if (recaptchaElement) {
        recaptchaElement.style.display = 'block';
        recaptchaElement.style.minHeight = '78px';
      }

      // Add a small delay to ensure reCAPTCHA is ready
      setTimeout(() => {
        console.log('Attempting to send SMS code...');
        console.log('Resolver:', currentResolver.current);
        console.log('Auth:', auth);
        console.log(
          'Recaptcha container:',
          document.getElementById('recaptcha')
        );

        sendMfaPhoneLoginCode({
          resolver: currentResolver.current!,
          recaptchaContainerId: 'recaptcha',
          auth,
        })
          .then(() => {
            console.log('SMS code sent successfully');
            setIsCodeSent(true);
          })
          .catch((error) => {
            console.error('Error sending SMS code:', error);
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              stack: error.stack,
            });

            // Try again with a longer delay if first attempt fails
            setTimeout(() => {
              console.log('Retrying SMS code send...');
              sendMfaPhoneLoginCode({
                resolver: currentResolver.current!,
                recaptchaContainerId: 'recaptcha',
                auth,
              })
                .then(() => {
                  console.log('SMS code sent successfully on retry');
                  setIsCodeSent(true);
                })
                .catch((retryError) => {
                  console.error('Error sending SMS code on retry:', retryError);
                  console.error('Retry error details:', {
                    code: retryError.code,
                    message: retryError.message,
                    stack: retryError.stack,
                  });
                });
            }, 2000);
          });
      }, 1000);
    } else if (method === 'totp') {
      setHasTotp(true);
    }
  };

  useEffect(() => {
    signInWithEmailLink({
      auth,
      url: window.location.href,
    })
      .then((userCredential) => {
        setUserCredential(userCredential);
        userCredentialRef.current = userCredential;
        console.log('User signed in with email link:', userCredential.user.uid);
      })
      .catch((error) => {
        console.error('Email link sign-in error:', error);
        const result = getMfaResolverInfo({
          multiFactorError: error,
          auth,
        });
        if (result && result.types.length >= 1) {
          handleMfa(result);
        }
      });
  }, []);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      {userCredential?.user && (
        <p
          data-testid='signin-with-link-user-email'
          className='text-lg font-semibold text-green-600'
        >
          {userCredential.user.uid}
        </p>
      )}

      {showMfaOptions && (
        <div className='mt-4 p-4 bg-gray-100 rounded-lg max-w-md'>
          <h3 className='text-lg font-semibold mb-3 text-center'>
            Choose 2FA Method
          </h3>
          <p className='text-sm text-gray-600 mb-4 text-center'>
            You have multiple 2FA methods enrolled. Please choose one to
            continue:
          </p>
          <div className='flex flex-col gap-3'>
            {availableMfaTypes.includes('sms') && (
              <button
                onClick={() => handleMfaMethodSelection('sms')}
                className='px-6 py-3 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
                data-testid='select-sms-2fa'
              >
                📱 SMS Code
              </button>
            )}
            {availableMfaTypes.includes('totp') && (
              <button
                onClick={() => handleMfaMethodSelection('totp')}
                className='px-6 py-3 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75'
                data-testid='select-totp-2fa'
              >
                🔐 Authenticator App (TOTP)
              </button>
            )}
          </div>
        </div>
      )}

      {isCodeSent && (
        <input
          type='text'
          placeholder='Enter Phone Code'
          className='px-4 py-2 border rounded-md'
          value={mfaCode}
          onChange={handleOtpCodeChange}
          data-testid='otp-code-input'
        />
      )}

      {hasTotp && (
        <div>
          <input
            type='text'
            placeholder='Enter TOTP Code'
            className='px-4 py-2 border rounded-md'
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            data-testid='totp-code-input'
          />
        </div>
      )}

      {isCodeSent && (
        <button
          onClick={verifyCode}
          className='px-4 py-2 mb-2 text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75'
          data-testid='verify-code-button'
        >
          Verify Code
        </button>
      )}

      {hasTotp && (
        <button
          onClick={async () => {
            const userCredential = await verifyMfaCode({
              verificationCode: totpCode,
              multiFactorResolver: currentResolver.current!,
              type: 'totp',
            });
            setUserCredential(userCredential as UserCredential);
          }}
          className='px-4 py-2 mb-2 text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75'
          data-testid='verify-totp-button'
        >
          Sign in with TOTP
        </button>
      )}

      <div
        id='recaptcha'
        style={{
          minHeight: '78px',
          width: '100%',
          display: 'block',
          margin: '10px 0',
        }}
      ></div>
    </div>
  );
};

export default Page;
