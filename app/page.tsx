import Link from 'next/link';

export default function Home() {
  const pages = [
    {
      href: '/signin',
      label: 'Sign In',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      href: '/signup',
      label: 'Sign Up',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      href: '/mfa',
      label: 'Multi-Factor enrollment',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      href: '/manage-user',
      label: 'Manage User',
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      href: '/store-functions',
      label: 'Store Functions',
      color: 'bg-teal-500 hover:bg-teal-600',
    },
  ];

  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2 px-4'>
      <h1 className='text-4xl font-bold mb-8 text-center'>
        Quick Fire Auth & DB Demo
      </h1>
      <p className='text-lg text-gray-600 mb-8 text-center max-w-2xl'>
        E2E Testing Application and Demo for Quick Fire Auth and Store packages
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl'>
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className={`px-6 py-4 text-white rounded-lg text-center font-medium transition-colors duration-200 ${page.color}`}
          >
            {page.label}
          </Link>
        ))}
      </div>

      <div className='mt-12 text-center'>
        <h2 className='text-2xl font-semibold mb-4'>Available Features</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl'>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='font-semibold text-lg mb-2'>Authentication</h3>
            <ul className='space-y-1 text-sm text-gray-600'>
              <li>• Email/Password Sign In & Sign Up</li>
              <li>
                • Social Authentication (Google, GitHub) - Integrated in Sign In
              </li>
              <li>• Email Link Authentication</li>
              <li>• Multi-Factor Authentication (MFA)</li>
              <li>• User Management & Password Reset</li>
            </ul>
          </div>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='font-semibold text-lg mb-2'>Firestore Operations</h3>
            <ul className='space-y-1 text-sm text-gray-600'>
              <li>• Document CRUD Operations</li>
              <li>• Query Operations & Filtering</li>
              <li>• Real-time Data Watching</li>
              <li>• Aggregate Functions (Count, Sum, Average)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
