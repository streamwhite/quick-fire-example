'use client';
import {
  and,
  collection,
  createCollectionGroupQuery,
  createDoc,
  createQuery,
  DocumentWithId as FirestoreDocumentWithId,
  getDocsData,
  where,
} from 'quick-fire-store';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CONSTANTS } from '../utils';
import CollapsibleDataDisplay from './CollapsibleDataDisplay';
import { BaseComponentProps, DocumentData } from './types';

const TEST_COLLECTION = CONSTANTS.get('TEST_COLLECTION');
const TEST_GROUP_COLLECTION = 'comments';

export const QueryExamples: React.FC<BaseComponentProps> = ({
  db,
  setError,
  setLoading,
}) => {
  const [queryResults, setQueryResults] = useState<{
    createQuery: FirestoreDocumentWithId<DocumentData>[] | null;
    createCollectionGroupQuery: FirestoreDocumentWithId<DocumentData>[] | null;
  }>({
    createQuery: null,
    createCollectionGroupQuery: null,
  });
  const [testDocsCreated, setTestDocsCreated] = useState(false);
  const [groupTestDocsCreated, setGroupTestDocsCreated] = useState(false);

  // Create test documents for createQuery example
  const createTestDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create multiple test documents with different properties
      const testData = [
        {
          title: 'Query Test Document 1',
          qty: 15,
          desc: 'This is a test document for createQuery example',
          category: 'electronics',
          isActive: true,
        },
        {
          title: 'Query Test Document 2',
          qty: 25,
          desc: 'Another test document for createQuery example',
          category: 'books',
          isActive: true,
        },
        {
          title: 'Query Test Document 3',
          qty: 5,
          desc: 'Third test document for createQuery example',
          category: 'electronics',
          isActive: false,
        },
        {
          title: 'Query Test Document 4',
          qty: 35,
          desc: 'Fourth test document for createQuery example',
          category: 'clothing',
          isActive: true,
        },
      ];

      for (const docData of testData) {
        await createDoc({
          db,
          collectionPath: TEST_COLLECTION,
          docData,
          docCustomId: undefined,
        });
      }

      setTestDocsCreated(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Create test comments for createCollectionGroupQuery example
  const createGroupTestDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create a unique test session ID to distinguish this test run
      const testSessionId = `test-${Date.now()}`;

      // Generate unique UUIDs for post IDs
      const postIds = [uuidv4(), uuidv4(), uuidv4()];

      // First, create the parent posts
      const postData = [
        {
          title: 'Museum Review Post 1',
          content: 'A post about museums in New York',
          author: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          title: 'Park Review Post 2',
          content: 'A post about parks in California',
          author: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          title: 'Museum Review Post 3',
          content: 'A post about museums in Texas',
          author: 'admin',
          createdAt: new Date().toISOString(),
        },
      ];

      // Create the parent posts first with UUID IDs
      for (let i = 0; i < postData.length; i++) {
        await createDoc({
          db,
          collectionPath: 'posts',
          docData: postData[i],
          docCustomId: postIds[i], // Use UUID for unique post IDs
        });
      }

      // Now create comments in the subcollections
      const groupTestData = [
        {
          content: 'This is a great museum!',
          author: 'user1',
          type: 'museum',
          rating: 5,
          location: 'New York',
          testSessionId: testSessionId,
        },
        {
          content: 'Beautiful park for a walk',
          author: 'user2',
          type: 'park',
          rating: 4,
          location: 'California',
          testSessionId: testSessionId,
        },
        {
          content: 'Amazing art collection at this museum',
          author: 'user3',
          type: 'museum',
          rating: 5,
          location: 'Texas',
          testSessionId: testSessionId,
        },
      ];

      // Create comments in the subcollections of the created posts
      for (let i = 0; i < groupTestData.length; i++) {
        const commentData = groupTestData[i];
        await createDoc({
          db,
          collectionPath: `posts/${postIds[i]}/${TEST_GROUP_COLLECTION}`,
          docData: commentData,
          docCustomId: undefined,
        });
      }

      setGroupTestDocsCreated(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Example 1: createQuery with getDocsData
  const runCreateQueryExample = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create a query to find active documents with qty > 10
      const query = createQuery({
        collectionRef: collection(db, TEST_COLLECTION),
        compositeFilterConstraint: and(
          where('isActive', '==', true),
          where('qty', '>', 10)
        ),
      });

      // Execute the query and get documents data
      const docsData = await getDocsData({
        query,
        isFromCache: false,
      });

      setQueryResults((prev) => ({
        ...prev,
        createQuery: docsData,
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: createCollectionGroupQuery with getDocsData
  const runCreateCollectionGroupQueryExample = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create a collection group query to find all museum comments across different posts
      // Filter by both type and content field to get only the new comment structure
      const groupQuery = createCollectionGroupQuery({
        db,
        nestedCollectionName: TEST_GROUP_COLLECTION,
        compositeFilterConstraint: and(
          where('content', '!=', null),
          where('type', '==', 'museum')
        ),
      });

      // Execute the collection group query and get documents data
      const docsData = await getDocsData({
        query: groupQuery,
        isFromCache: false,
      });

      setQueryResults((prev) => ({
        ...prev,
        createCollectionGroupQuery: docsData,
      }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mb-8 border rounded-lg p-4 bg-gray-50'>
      <h2 className='text-xl font-semibold mb-4'>
        Query Examples with getDocsData
      </h2>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* createQuery Example */}
        <div className='border rounded p-4 bg-white'>
          <h3 className='font-medium mb-3 text-blue-700'>
            createQuery Example
          </h3>
          <p className='text-sm text-gray-600 mb-4'>
            This example demonstrates using{' '}
            <code className='bg-gray-100 px-1 rounded'>createQuery</code> to
            query a specific collection with filters, then using{' '}
            <code className='bg-gray-100 px-1 rounded'>getDocsData</code> to
            retrieve the results.
          </p>

          <div className='space-y-3'>
            <button
              className='w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              data-testid='create-query-test-docs'
              onClick={createTestDocuments}
            >
              Create Test Documents for createQuery
            </button>

            {testDocsCreated && (
              <div className='p-3 bg-green-50 rounded border border-green-200'>
                <p className='text-green-700 text-sm'>
                  ✓ Test documents created successfully!
                </p>
              </div>
            )}

            <button
              className='w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
              data-testid='run-create-query'
              disabled={!testDocsCreated}
              onClick={runCreateQueryExample}
            >
              Run createQuery: Active docs with qty &gt; 10
            </button>

            {queryResults.createQuery && (
              <div className='mt-3'>
                <CollapsibleDataDisplay
                  data={queryResults.createQuery}
                  title='createQuery Results'
                  testId='create-query-results'
                  className='text-blue-500 p-2 bg-gray-50 rounded overflow-auto'
                />
              </div>
            )}
          </div>
        </div>

        {/* createCollectionGroupQuery Example */}
        <div className='border rounded p-4 bg-white'>
          <h3 className='font-medium mb-3 text-purple-700'>
            createCollectionGroupQuery Example
          </h3>
          <p className='text-sm text-gray-600 mb-4'>
            This example demonstrates using{' '}
            <code className='bg-gray-100 px-1 rounded'>
              createCollectionGroupQuery
            </code>{' '}
            to query across multiple comments subcollections in different posts.
            First creates posts and comments, then queries all museum comments
            using <code className='bg-gray-100 px-1 rounded'>getDocsData</code>.
          </p>

          <div className='space-y-3'>
            <button
              className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
              data-testid='create-group-query-test-docs'
              onClick={createGroupTestDocuments}
            >
              Create Posts and Comments for createCollectionGroupQuery
            </button>

            {groupTestDocsCreated && (
              <div className='p-3 bg-green-50 rounded border border-green-200'>
                <p className='text-green-700 text-sm'>
                  ✓ Posts and comments created successfully!
                </p>
                <p className='text-xs text-gray-600 mt-1'>
                  Posts created with unique UUIDs
                  <br />
                  Comments created in posts/{TEST_GROUP_COLLECTION}{' '}
                  subcollections
                </p>
              </div>
            )}

            <button
              className='w-full px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
              data-testid='run-create-group-query'
              disabled={!groupTestDocsCreated}
              onClick={runCreateCollectionGroupQueryExample}
            >
              Run createCollectionGroupQuery: Find all museum comments
            </button>

            {queryResults.createCollectionGroupQuery && (
              <div className='mt-3'>
                <CollapsibleDataDisplay
                  data={queryResults.createCollectionGroupQuery}
                  title='Museum Comments Found'
                  testId='create-group-query-results'
                  className='text-purple-500 p-2 bg-gray-50 rounded overflow-auto'
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className='mt-6 border rounded p-4 bg-gray-100'>
        <h3 className='font-medium mb-3'>Code Examples</h3>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <div>
            <h4 className='font-medium text-sm mb-2'>createQuery Example:</h4>
            <pre className='text-xs bg-white p-3 rounded border overflow-x-auto'>
              {`// Create a query with filters
const query = createQuery({
  collectionRef: collection(db, '${TEST_COLLECTION}'),
  compositeFilterConstraint: and(
    where('isActive', '==', true),
    where('qty', '>', 10)
  ),
});

// Execute query and get data
const docsData = await getDocsData({
  query,
  isFromCache: false,
});`}
            </pre>
          </div>
          <div>
            <h4 className='font-medium text-sm mb-2'>
              createCollectionGroupQuery Example:
            </h4>
            <pre className='text-xs bg-white p-3 rounded border overflow-x-auto'>
              {`// Create a collection group query to find all museum comments
const groupQuery = createCollectionGroupQuery({
  db,
  nestedCollectionName: '${TEST_GROUP_COLLECTION}',
  compositeFilterConstraint: and(
    where('type', '==', 'museum'),
    where('content', '!=', null) // Filter for new comment structure
  ),
});

// Execute query and get all matching comments
const commentsData = await getDocsData({
  query: groupQuery,
  isFromCache: false,
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryExamples;
