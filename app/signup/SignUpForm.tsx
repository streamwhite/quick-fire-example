import { User } from 'firebase/auth';
import {
  sendEmailAddressVerificationEmail,
  signUpWithEmailAndPassword,
  watchAuth,
} from 'quick-fire-auth';
import { useEffect, useState } from 'react';
import { auth } from '../_lib/auth';

interface SignUpFormProps {
  user: User | null;
  setUser: (user: User | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export default function SignUpForm({
  user,
  setUser,
  error,
  setError,
}: SignUpFormProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);

  useEffect(() => {
    const unsubscribe = watchAuth({
      handleUser: (user) => {
        if (user) {
          setUser(user);
          // Send email verification after successful sign up
          if (!user.emailVerified && !isEmailVerificationSent) {
            sendEmailAddressVerificationEmail({
              user,
              auth,
              locale: 'en',
            })
              .then(() => {
                setIsEmailVerificationSent(true);
              })
              .catch((error) => {
                console.error('Error sending verification email:', error);
                setError('Failed to send verification email');
              });
          }
        } else {
          setUser(null);
        }
      },
      auth,
    });
    return () => unsubscribe();
  }, [setUser, isEmailVerificationSent, setError]);

  return (
    <div className='signup flex flex-col space-y-4'>
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
      <button
        className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
        onClick={() => {
          signUpWithEmailAndPassword({
            email,
            password,
            auth,
            hasPassWordPolicyEnabled: false,
          }).catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
              setError('User already exists');
            } else {
              setError(error.message);
            }
          });
        }}
        data-testid='sign-up'
      >
        Sign Up
      </button>
      <div>
        {user && (
          <div>
            <p data-testid='signed-in'>{(user as User)?.uid}</p>
          </div>
        )}
      </div>
      <div>
        {error && (
          <div>
            <p data-testid='existed-user'>{error}</p>
          </div>
        )}
      </div>
      {user && !user.emailVerified && isEmailVerificationSent && (
        <div className='mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md'>
          <p className='text-yellow-800' data-testid='email-verification-sent'>
            A verification email has been sent to {user.email}. Please check
            your inbox and click the verification link to complete your
            registration.
          </p>
        </div>
      )}
      {user && user.emailVerified && (
        <div className='mt-4 p-4 bg-green-100 border border-green-400 rounded-md'>
          <p className='text-green-800' data-testid='email-verified'>
            ✅ Your email has been verified successfully!
          </p>
        </div>
      )}
    </div>
  );
}
