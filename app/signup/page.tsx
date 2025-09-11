'use client';
import { User } from 'firebase/auth';
import { useState } from 'react';
import SignUpForm from './SignUpForm';

export default function SignUp() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      <h1 className='text-4xl font-bold mb-8'>Sign Up</h1>
      <SignUpForm
        user={user}
        setUser={setUser}
        error={error}
        setError={setError}
      />
    </div>
  );
}
