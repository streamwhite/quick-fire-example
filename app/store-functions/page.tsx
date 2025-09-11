'use client';
import { getFirestore, initializeApp } from 'quick-fire-store';
import { useState } from 'react';
import { useAuth } from '../_lib/auth-context';
import { config } from '../_lib/config';
import AggregateOperations from './components/AggregateOperations';
import DocumentOperations from './components/DocumentOperations';
import QueryExamples from './components/QueryExamples';
import UpdateOperations from './components/UpdateOperations';
import WatchOperations from './components/WatchOperations';

const app = initializeApp(config);
const db = getFirestore(app);

const FirestoreFunctionsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className='p-4 max-w-6xl mx-auto'>
        <div className='flex items-center justify-center min-h-64'>
          <div className='text-lg'>Loading...</div>
        </div>
      </div>
    );
  }

  // Show authentication required message if user is not signed in
  if (!user) {
    return (
      <div className='p-4 max-w-6xl mx-auto'>
        <h1 className='text-2xl font-bold mb-6 text-center'>
          Store Lib Functions E2E Testing
        </h1>
        <div className='mt-4 p-4 bg-red-100 border border-red-400 rounded-md max-w-md mx-auto'>
          <p
            className='text-red-800 text-center'
            data-testid='store-functions-signin-required'
          >
            Please sign in first to access Store Functions testing features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6 text-center'>
        Store Lib Functions E2E Testing
      </h1>

      {/* Security Rules Notice */}
      {/* <div className='mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-md'>
        <h2 className='text-lg font-semibold mb-2 text-yellow-800'>
          🔒 Firestore Security Rules Notice
        </h2>
        <p className='text-yellow-700 text-sm'>
          If you encounter &quot;Missing or insufficient permissions&quot;
          errors, check your Firestore security rules. For testing purposes, you
          may need to temporarily allow read/write access to the
          &apos;posts&apos; collection.
        </p>
        <p className='text-yellow-700 text-sm mt-2'>
          <strong>Recommended test rules:</strong>
        </p>
        <pre className='text-xs bg-yellow-50 p-2 rounded mt-2 overflow-x-auto'>
          {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{document} {
      allow read, write: if true;
    }
  }
}`}
        </pre>
      </div> */}

      {/* Query Examples Section */}
      <QueryExamples db={db} setError={setError} setLoading={setLoading} />

      {/* Aggregate Operations Section */}
      <AggregateOperations
        db={db}
        setError={setError}
        setLoading={setLoading}
      />

      {/* Document Operations Section */}
      <div className='mb-8 border rounded-lg p-4 bg-gray-50'>
        <h2 className='text-xl font-semibold mb-4'>Document Operations</h2>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <div>
            <DocumentOperations
              db={db}
              setError={setError}
              setLoading={setLoading}
            />
          </div>
          <div>
            <UpdateOperations
              db={db}
              setError={setError}
              setLoading={setLoading}
            />
          </div>
        </div>
      </div>

      {/* Watch Operations Section */}
      <WatchOperations db={db} setError={setError} setLoading={setLoading} />

      {/* Status Section */}
      {(loading || error) && (
        <div className='fixed bottom-4 right-4 p-4 rounded-lg shadow-lg'>
          {loading && (
            <div className='bg-blue-100 text-blue-700 p-3 rounded'>
              Loading...
            </div>
          )}
          {error && (
            <div className='bg-red-100 text-red-700 p-3 rounded'>{error}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default FirestoreFunctionsPage;
