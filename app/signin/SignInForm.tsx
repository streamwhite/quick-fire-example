import {
  AuthCredential,
  MultiFactorResolver,
  reauthenticateWithCredential,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  getAuthCredential,
  getMfaResolverInfo,
  sendMfaPhoneLoginCode,
  sendSignInLinkToEmail,
  signInWithEmailAndPassword,
  signInWithSocialProvider,
  verifyMfaCode,
  watchAuth,
} from 'quick-fire-auth';
import { useEffect, useRef, useState } from 'react';
import { auth } from '../_lib/auth';

interface SignInFormProps {
  user: User | null;
  setUser: (user: User | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function SignInForm({
  user,
  setUser,
  error,
  setError,
}: SignInFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [hasTotp, setHasTotp] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [showMfaOptions, setShowMfaOptions] = useState(false);
  const [availableMfaTypes, setAvailableMfaTypes] = useState<string[]>([]);
  const currentResolver = useRef<MultiFactorResolver | null>(null);
  const mfaType = useRef<'sms' | 'totp' | null>(null);
  const userCredentialRef = useRef<UserCredential | null>(null);

  useEffect(() => {
    const unsubscribe = watchAuth({
      handleUser: (user) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      },
      auth,
    });
    return () => unsubscribe();
  }, [setUser]);

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
          console.log('isCodeSent', 'yes');
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
          setUser(userCredential?.user as User);
        })
        .catch((error) => {
          console.error('verify code error:', error);
          setError(error.message);
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

  const handleGoogleSignIn = async () => {
    if (user) return; // Prevent action if user is signed in
    try {
      await signInWithSocialProvider({ providerName: 'google', auth }).catch(
        (error) => {
          const result = getMfaResolverInfo({ multiFactorError: error, auth });
          if (result && result.types.length >= 1) {
            handleMfa(result);
          }
        }
      );
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleGithubSignIn = async () => {
    if (user) return; // Prevent action if user is signed in
    try {
      await signInWithSocialProvider({ providerName: 'github', auth })
        .then((userCredential) => {
          userCredentialRef.current = userCredential;
          setTimeout(() => {
            const credential = getAuthCredential({
              userCredential,
              provider: 'github',
            }) as AuthCredential;
            reauthenticateWithCredential(userCredential.user!, credential)
              .then((userCredential) => {
                // log user id
                console.log('user id:', userCredential.user?.uid);
              })
              .catch((error) => {
                const result = getMfaResolverInfo({
                  multiFactorError: error,
                  auth,
                });
                if (result && result.types.length >= 1) {
                  handleMfa(result);
                }
              });
          }, 0.5 * 60 * 1000 + 1 * 1000);
        })
        .catch((error) => {
          const result = getMfaResolverInfo({ multiFactorError: error, auth });
          if (result && result.types.length >= 1) {
            handleMfa(result);
          }
        });
    } catch (error) {
      console.error('GitHub sign-in error:', error);
    }
  };

  return (
    <div className='signin flex flex-col space-y-4'>
      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className='px-4 py-2 border rounded-md'
        data-testid='email-input'
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className='px-4 py-2 border rounded-md'
        data-testid='password-input'
      />

      {showMfaOptions && (
        <div className='mt-4 p-4 bg-gray-100 rounded-lg'>
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
      <button
        className={`px-4 py-2 text-white rounded-md ${
          user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={() => {
          if (user) return; // Prevent action if user is signed in
          signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              setUser(userCredential.user);
              userCredentialRef.current = userCredential;
              setTimeout(() => {
                const confs = getAuthCredential({
                  provider: 'email-password',
                  email,
                  password,
                  userCredential: userCredentialRef.current as UserCredential,
                });
                reauthenticateWithCredential(
                  userCredentialRef.current?.user as User,
                  confs as AuthCredential
                )
                  .then(() => {
                    console.log('User re-authenticated');
                  })
                  .catch((error) => {
                    const resolverInfo = getMfaResolverInfo({
                      multiFactorError: error,
                      auth,
                    });
                    if (resolverInfo && resolverInfo.types.length >= 1) {
                      handleMfa(resolverInfo);
                    }
                  });
              }, 0.5 * 60 * 1000 + 1 * 1000);
            })
            .catch((error) => {
              if (error.code === 'auth/user-not-found') {
                setError('User not found');
              } else if (error.code === 'auth/multi-factor-auth-required') {
                // Handle MFA silently without showing error message
                const resolverInfo = getMfaResolverInfo({
                  multiFactorError: error,
                  auth,
                });
                if (resolverInfo && resolverInfo.types.length >= 1) {
                  handleMfa(resolverInfo);
                }
              } else {
                setError(error.message);
                const resolverInfo = getMfaResolverInfo({
                  multiFactorError: error,
                  auth,
                });
                if (resolverInfo && resolverInfo.types.length >= 1) {
                  handleMfa(resolverInfo);
                }
              }
            });
        }}
        data-testid='sign-in'
      >
        Sign In
      </button>

      {isCodeSent && (
        <button
          onClick={verifyCode}
          className='px-4 py-2 mb-2 text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75'
          data-testid='verify-code-button'
        >
          Verify phone Code
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
            setUser(userCredential?.user as User);
            userCredentialRef.current = userCredential;
            setTimeout(() => {
              const confs = getAuthCredential({
                userCredential: userCredentialRef.current!,
                provider: 'email-password',
                email,
                password,
              });
              reauthenticateWithCredential(
                userCredential.user!,
                confs as AuthCredential
              )
                .then(() => {})
                .catch((error) => {
                  const resolverInfo = getMfaResolverInfo({
                    multiFactorError: error,
                    auth,
                  });
                  if (resolverInfo && resolverInfo.types.length >= 1) {
                    handleMfa(resolverInfo);
                  }
                });
            }, 0.5 * 60 * 1000 + 30 * 1000);
          }}
          className='px-4 py-2 mb-2 text-white bg-yellow-500 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75'
          data-testid='verify-totp-button'
        >
          Sign in with TOTP
        </button>
      )}
      <button
        className={`px-4 py-2 text-white rounded-md ${
          user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'
        }`}
        onClick={() => {
          if (user) return; // Prevent action if user is signed in
          const actionCodeSettings = {
            url: `https://127.0.0.1:3000/signin-with-email-link?email=${email}`,
            handleCodeInApp: true,
          };

          sendSignInLinkToEmail({ email, actionCodeSettings, auth }).then(
            () => {
              console.log('Email sent');
            }
          );
        }}
        disabled={!!user}
        data-testid='send-signin-link-button'
      >
        Send Email Link
      </button>

      <a
        href='/mfa'
        className='px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-center'
        data-testid='enroll-mfa-link'
      >
        Enroll MFA
      </a>

      <div className='mt-4 pt-4 border-t border-gray-300'>
        <p className='text-center text-gray-600 mb-3'>Or sign in with:</p>
        <div className='flex flex-col space-y-2'>
          <button
            onClick={handleGoogleSignIn}
            className={`px-4 py-2 text-white rounded focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
              user
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'
            }`}
            disabled={!!user}
            data-testid='google-signin'
          >
            Sign in with Google
          </button>
          <button
            onClick={handleGithubSignIn}
            className={`px-4 py-2 text-white rounded focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
              user
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-400'
            }`}
            disabled={!!user}
            data-testid='github-signin'
          >
            Sign in with GitHub
          </button>
        </div>
      </div>

      <div>
        {user && (
          <div className='mt-4 p-4 bg-green-100 border border-green-400 rounded-md'>
            <p
              className='text-green-800 text-center mb-3'
              data-testid='signed-in'
            >
              Signed in as: {(user as User)?.uid}
            </p>
            <div className='flex flex-col space-y-2'>
              <a
                href='/manage-user'
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-center'
                data-testid='manage-user-link'
              >
                Manage User
              </a>
              <a
                href='/mfa'
                className='px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-center'
                data-testid='enroll-mfa-link-signed-in'
              >
                Enroll MFA
              </a>
            </div>
          </div>
        )}
      </div>
      <div>
        {error && (
          <div>
            <p data-testid='sign-in-error'>{error}</p>
          </div>
        )}
      </div>
      <div>
        {error && (
          <div>
            <p data-testid='sign-out-error'>{error}</p>
          </div>
        )}
      </div>
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
}
