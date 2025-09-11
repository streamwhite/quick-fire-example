export const testIds = {
  emailInput: 'email-input',
  passwordInput: 'password-input',
  signUpButton: 'sign-up',
  signInButton: 'sign-in',
  signOutButton: 'sign-out',
  signedIn: 'signed-in',
  notSignedIn: 'not-sign-in',
  existedUser: 'existed-user',
  signInError: 'sign-in-error',
  signOutError: 'sign-out-error',

  sendEmailButton: 'send-email-button',

  emailSentMessage: 'email-sent-message',
  sendVerificationEmailButton: 'send-verification-email-button',

  updateEmailButton: 'update-email-button',
  verifyNewEmailButton: 'verify-new-email-button',
  updateEmailInput: 'update-email-input',
  currentPasswordInput: 'current-password-input',
  currentEmailInput: 'current-email-input',
  emailUpdatedMessage: 'email-updated-message',

  updatePasswordButton: 'update-password-button', // New test ID
  updatePasswordInput: 'update-password-input', // New test
  passwordUpdatedMessage: 'password-updated-message', // New test ID
  deleteUserButton: 'delete-user-button', // New test ID
  userExistsMessage: 'user-exists-message', // New test ID

  signinWithLinkUserEmail: 'signin-with-link-user-email',
  sendSigninLinkButton: 'send-signin-link-button',

  socialSignedIn: 'social-signed-in',
  googleSignin: 'google-signin',
  appleSignin: 'apple-signin',
  githubSignin: 'github-signin',
  facebookSignin: 'facebook-signin',
  twitterSignin: 'twitter-signin',
  microsoftSignin: 'microsoft-signin',

  mfaSignedIn: 'mfa-signed-in',
  mfaSmsSignin: 'mfa-sms-signin',

  // MFA test IDs
  selectSms2fa: 'select-sms-2fa',
  selectTotp2fa: 'select-totp-2fa',
  otpCodeInput: 'otp-code-input',
  totpCodeInput: 'totp-code-input',
  verifyCodeButton: 'verify-code-button',
  verifyTotpButton: 'verify-totp-button',
};

// Add any confidentials here
export const confidentials = {
  // increment me or use faker js
  signup: {
    email: 't15@t.com',
    password: '123456',
  },
  signin: {
    email: 'streamwhite@hotmail.com',
    password: '2vtLpME8qN6KgK',
    wrongPassword: 'password1234',
    wrongEmail: 'wrong@example.com',
  },
  manage: {
    newpassword: '2vtLpME8qN6KgK',
    newemail: 'herwidget@outlook.com',
  },
};
