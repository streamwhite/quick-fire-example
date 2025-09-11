'use client';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { auth } from './auth';
import { useAuth } from './auth-context';

export default function Navigation() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <nav className='bg-gray-800 text-white p-4'>
        <div className='container mx-auto flex justify-between items-center'>
          <Link href='/' className='text-xl font-bold'>
            Quick Fire Demo
          </Link>
          <div>Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className='bg-gray-800 text-white p-4'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link href='/' className='text-xl font-bold'>
          Quick Fire Demo
        </Link>

        <div className='flex items-center space-x-4'>
          {user ? (
            <>
              <span className='text-sm'>
                Signed in as: {user.email || user.uid}
              </span>
              <button
                onClick={handleSignOut}
                className='px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors'
                data-testid='sign-out'
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className='flex space-x-2'>
              <Link
                href='/signin'
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
              >
                Sign In
              </Link>
              <Link
                href='/signup'
                className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors'
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
