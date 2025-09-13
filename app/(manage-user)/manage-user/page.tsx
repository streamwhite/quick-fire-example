'use client';

import { auth } from '@/app/_lib/auth';
import { confidentials } from '@/tests/auth/constants';
import {
  deleteUser,
  LanguageCodes,
  sendPasswordResetEmail,
  sendEmailVerification as sendVerificationEmail,
  verifyAndUpdateEmail as updateEmail,
  updatePassword,
  verifyAndUpdateEmail as verifyBeforeUpdateEmail,
  watchAuth,
} from 'quick-fire-auth';
import { useEffect, useState } from 'react';

const { email } = confidentials.signin;
const lang = 'zh-tw';

const ResetPassPage = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerificationEmailSent, setIsVerificationEmailSent] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailUpdated, setIsEmailUpdated] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const [isNewEmailVerificationSent, setNewEmailVerificationSent] =
    useState(false);

  useEffect(() => {
    const unsubscribe = watchAuth({
      handleUser: (user) => {
        setUser(user || null);
      },
      auth,
    });
    return () => unsubscribe();
  }, []);

  const handleSendPasswordResetEmail = () => {
    sendPasswordResetEmail({
      email,
      auth,
      locale: lang as LanguageCodes,
    }).then(() => {
      setIsEmailSent(true);
    });
  };

  const handleSendVerificationEmail = () => {
    sendVerificationEmail({
      user: auth.currentUser!,
      auth,
      locale: lang as LanguageCodes,
    }).then(() => {
      setIsVerificationEmailSent(true);
    });
  };

  const handleVerifyNewEmail = async () => {
    if (auth.currentUser) {
      try {
        // verify and update email at same time
        await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
        setNewEmailVerificationSent(true);
      } catch (error) {
        console.error('Error verifying new email:', error);
      }
    }
  };

  const handleUpdateEmail = async () => {
    // it is deprecated
    if (auth.currentUser) {
      try {
        await updateEmail(auth.currentUser, newEmail);
        setIsEmailUpdated(true);
        await sendVerificationEmail({
          user: auth.currentUser,
          auth,
          locale: lang as LanguageCodes,
        });
        setIsVerificationEmailSent(true);
      } catch (error) {
        console.error('Error updating email:', error);
      }
    }
  };

  const handleUpdatePassword = () => {
    if (auth.currentUser) {
      updatePassword(auth.currentUser, newPassword).then(() => {
        setIsPasswordUpdated(true);
      });
    }
  };
  const handleDeleteUser = () => {
    if (auth.currentUser) {
      deleteUser(auth.currentUser).then(() => {
        setUser(null);
      });
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      <h1 className='text-2xl font-bold mb-4'>Manage User</h1>

      {/* Sign-in check */}
      {!user && (
        <div className='mt-4 p-4 bg-red-100 border border-red-400 rounded-md max-w-md'>
          <p
            className='text-red-800 text-center'
            data-testid='manage-user-signin-required'
          >
            Please sign in first to access user management features.
          </p>
        </div>
      )}

      {user && (
        <div className='w-full max-w-2xl space-y-6'>
          {/* Email Operations Group */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-blue-800 mb-4'>
              Email Operations
            </h2>
            <div className='space-y-4'>
              <div className='flex flex-col sm:flex-row gap-2'>
                <button
                  data-testid='send-email-button'
                  onClick={handleSendPasswordResetEmail}
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  Send Password Reset Email
                </button>
                <button
                  data-testid='send-verification-email-button'
                  onClick={handleSendVerificationEmail}
                  className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  Send Email Verification
                </button>
              </div>
            </div>
          </div>

          {/* Verification Email Success Notice */}
          {isVerificationEmailSent && (
            <div className='mt-4 p-4 bg-green-100 border border-green-400 rounded-md'>
              <p
                className='text-green-800'
                data-testid='verification-email-sent-notice'
              >
                ✓ Verification email sent successfully! Please check your inbox
                and click the verification link to verify your email address.
              </p>
            </div>
          )}

          {/* Email Update Group */}
          <div className='bg-orange-50 border border-orange-200 rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-orange-800 mb-4'>
              Update Email Address
            </h2>
            <div className='space-y-4'>
              <input
                type='email'
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder='New Email Address'
                className='w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500'
                data-testid='update-email-input'
              />
              <div className='flex flex-col sm:flex-row gap-2'>
                <button
                  data-testid='verify-and-update-email-button'
                  onClick={handleVerifyNewEmail}
                  className='px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500'
                >
                  Verify and Update
                </button>
              </div>
            </div>
          </div>

          {/* Password Update Group */}
          <div className='bg-red-50 border border-red-200 rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-red-800 mb-4'>
              Update Password
            </h2>
            <div className='space-y-4'>
              <input
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='New Password'
                className='w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500'
                data-testid='update-password-input'
              />
              <button
                data-testid='update-password-button'
                onClick={handleUpdatePassword}
                className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Account Management Group */}
          <div className='bg-purple-50 border border-purple-200 rounded-lg p-6'>
            <h2 className='text-xl font-semibold text-purple-800 mb-4'>
              Account Management
            </h2>
            <div className='space-y-4'>
              <button
                data-testid='delete-user-button'
                onClick={handleDeleteUser}
                className='px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
              >
                Delete User Account
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Status Messages */}
      <div className='mt-8 w-full max-w-2xl'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>
          Operation Status
        </h3>
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-700'>
              Password Reset Email Sent:
            </span>
            <span
              className={`text-sm font-medium ${
                isEmailSent ? 'text-green-600' : 'text-gray-500'
              }`}
              data-testid='email-sent-message'
            >
              {isEmailSent ? '✓ Sent' : '✗ Not sent'}
            </span>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-700'>
              Email Updated:
            </span>
            <span
              className={`text-sm font-medium ${
                isEmailUpdated ? 'text-green-600' : 'text-gray-500'
              }`}
              data-testid='email-updated-message'
            >
              {isEmailUpdated ? '✓ Updated' : '✗ Not updated'}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-700'>
              Password Updated:
            </span>
            <span
              className={`text-sm font-medium ${
                isPasswordUpdated ? 'text-green-600' : 'text-gray-500'
              }`}
              data-testid='password-updated-message'
            >
              {isPasswordUpdated ? '✓ Updated' : '✗ Not updated'}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium text-gray-700'>
              User Status:
            </span>
            <span
              className={`text-sm font-medium ${
                user ? 'text-green-600' : 'text-red-500'
              }`}
              data-testid='user-exists-message'
            >
              {user ? '✓ Signed in' : '✗ Not signed in'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassPage;
