'use client';
import {
  and,
  collection,
  createDoc,
  createQuery,
  doc,
  DocumentWithId as FirestoreDocumentWithId,
  getDocData,
  getDocsData,
  where,
} from 'quick-fire-store';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  updateArrayRemove,
  updateArrayUnion,
  updateIncrement,
  updateObjectFields,
  updatePrimitiveField,
} from '../updateOperations';
import { CONSTANTS } from '../utils';
import CollapsibleDataDisplay from './CollapsibleDataDisplay';
import { BaseComponentProps, DocumentData } from './types';

const TEST_COLLECTION = CONSTANTS.get('TEST_COLLECTION');

export const DocumentOperations: React.FC<BaseComponentProps> = ({
  db,
  setError,
  setLoading,
}) => {
  const [isDocCreated, setIsDocCreated] = useState(false);
  const [isDocExisted, setIsDocExisted] = useState(false);
  const [isDocCreateFailed, setIsDocCreateFailed] = useState(false);
  const [docData, setDocData] = useState<DocumentData | null>(null);
  const [docsData, setDocsData] = useState<
    FirestoreDocumentWithId<DocumentData>[] | null
  >(null);
  const [generatedDocId, setGeneratedDocId] = useState<string | null>(null);
  const [testUuid, setTestUuid] = useState<string>('');
  const [customIdCreated, setCustomIdCreated] = useState(false);
  const [customId, setCustomId] = useState<string | null>(null);
  const [testDocId, setTestDocId] = useState<string | null>(null);
  const [testDocCreated, setTestDocCreated] = useState(false);

  // Update operations state
  const [updateResults, setUpdateResults] = useState<{
    [key: string]: {
      status: 'success' | 'error' | 'pending';
      message: string;
      timestamp: number;
    };
  }>({});
  const [addedElements, setAddedElements] = useState<string[]>([]);

  // Generate UUID only on client side to prevent hydration mismatch
  useEffect(() => {
    setTestUuid(uuidv4());
  }, []);

  // Helper function to set update result
  const setUpdateResult = (
    operation: string,
    status: 'success' | 'error' | 'pending',
    message: string
  ) => {
    setUpdateResults((prev) => ({
      ...prev,
      [operation]: {
        status,
        message,
        timestamp: Date.now(),
      },
    }));
  };

  // Helper function to clear update results
  const clearUpdateResults = () => {
    setUpdateResults({});
  };

  return (
    <div>
      {/* Create Document */}
      <div className='border rounded p-4 bg-white'>
        <h3 className='font-medium mb-2'>Create Document</h3>

        {/* UUID for Testing */}
        <div className='mb-4 p-3 bg-blue-50 rounded border'>
          <p className='text-sm text-gray-600 mb-2'>
            Test UUID (click to copy):
          </p>
          <div className='flex items-center gap-2'>
            <p
              className='font-mono text-sm bg-white p-2 rounded border cursor-pointer hover:bg-gray-50 flex-1'
              onClick={() => navigator.clipboard.writeText(testUuid)}
              title='Click to copy'
              data-testid='test-uuid'
            >
              {testUuid}
            </p>
            <button
              className='px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700'
              onClick={() => setTestUuid(uuidv4())}
            >
              Generate New
            </button>
          </div>
        </div>

        <div className='space-y-2'>
          <button
            className='w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700'
            data-testid='create-doc'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const result = await createDoc({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docData: {
                    title: 'random title',
                    qty: 5,
                    desc: 'this is a random doc',
                  },
                  docCustomId: undefined,
                });
                // Extract document ID from result
                const docId = typeof result === 'string' ? result : result?.id;
                setGeneratedDocId(docId);
                setIsDocCreated(true);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Create New Document with Auto-Generated ID
          </button>
          {isDocCreated && (
            <div className='text-center mt-2'>
              <p data-testid='create-doc-success' className='text-green-500'>
                Document successfully created!
              </p>
              {generatedDocId && (
                <div className='mt-2 p-2 bg-gray-100 rounded border'>
                  <p className='text-sm text-gray-600 mb-1'>
                    Generated Document ID:
                  </p>
                  <p
                    className='font-mono text-sm bg-white p-2 rounded border cursor-pointer hover:bg-gray-50'
                    onClick={() =>
                      navigator.clipboard.writeText(generatedDocId)
                    }
                    title='Click to copy'
                    data-testid='generated-doc-id'
                  >
                    {generatedDocId}
                  </p>
                  <p className='text-xs text-gray-500 mt-1'>Click to copy</p>
                </div>
              )}
            </div>
          )}

          <button
            className='w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
            data-testid='create-doc-fail'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                setIsDocCreateFailed(false);
                await createDoc({
                  db,
                  collectionPath: 'invalid-collection',
                  docData: {
                    title: 'invalid',
                    qty: 0,
                    desc: 'this should fail',
                  },
                  docCustomId: undefined,
                });
              } catch (err) {
                setError((err as Error).message);
                setIsDocCreateFailed(true);
              } finally {
                setLoading(false);
              }
            }}
          >
            Test Invalid Collection Creation
          </button>
          {isDocCreateFailed && (
            <p
              className='text-red-500 text-center mt-2'
              data-testid='create-doc-fail-result'
            >
              Failed to create document
            </p>
          )}

          <button
            className='w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800'
            data-testid='check-doc-exists'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const existingDocId = prompt(
                  'Enter existed document ID to check:'
                );
                if (!existingDocId) {
                  setError('Document ID is required.');
                  return;
                }
                await createDoc({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docCustomId: existingDocId,
                  docData: {
                    title: 'existed doc Title',
                    qty: 0,
                    desc: 'this is an existed doc',
                  },
                });
              } catch (err) {
                setError((err as Error).message);
                setIsDocExisted(true);
              } finally {
                setLoading(false);
              }
            }}
          >
            Test Creating Document with Existing ID
          </button>
          {isDocExisted && (
            <p
              data-testid='create-doc-existed-result'
              className='text-red-500 text-center mt-2'
            >
              Document with this ID already exists!
            </p>
          )}

          <button
            className='w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700'
            data-testid='create-doc-with-id'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const customId = prompt('Enter custom document ID:');
                if (!customId) {
                  setError('Document ID is required.');
                  return;
                }
                await createDoc({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docCustomId: customId,
                  docData: {
                    title: 'Custom ID Title',
                    qty: 3,
                    desc: 'This is a doc with custom ID',
                  },
                });
                setCustomId(customId);
                setCustomIdCreated(true);
                setIsDocCreated(true);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Create Document with Custom ID
          </button>

          {/* Custom ID Creation Notice */}
          {customIdCreated && customId && (
            <div className='mt-3 p-3 bg-green-50 rounded border border-green-200'>
              <p className='text-green-700 font-medium text-sm mb-1'>
                ✓ Document created with custom ID successfully!
              </p>
              <p className='text-xs text-green-600'>
                Custom ID: <span className='font-mono'>{customId}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Get Document Data */}
      <div className='border rounded p-4 bg-white mt-4'>
        <h3 className='font-medium mb-2'>Get Document Data</h3>
        <div className='space-y-2'>
          <button
            className='w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
            data-testid='create-test-doc'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const result = await createDoc({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docData: {
                    title: 'Test Document Title',
                    qty: 10,
                    desc: 'This is a test document for testing getDocData',
                  },
                  docCustomId: undefined,
                });
                // Extract document ID from result
                const docId = typeof result === 'string' ? result : result?.id;
                setTestDocId(docId);
                setTestDocCreated(true);
                setIsDocCreated(true);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Create Test Document First
          </button>

          {/* Test Document ID Display */}
          {testDocCreated && testDocId && (
            <div className='mt-3 p-3 bg-blue-50 rounded border border-blue-200'>
              <p className='text-blue-700 font-medium text-sm mb-1'>
                ✓ Test document created successfully!
              </p>
              <p className='text-xs text-blue-600 mb-2'>
                Document ID: <span className='font-mono'>{testDocId}</span>
              </p>
              <p className='text-xs text-gray-500'>
                This ID will be used for the fetch operation below.
              </p>
            </div>
          )}

          <button
            className='w-full px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700'
            data-testid='get-doc-data'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);

                if (!testDocId) {
                  setError('Please create a test document first.');
                  return;
                }

                const docRef = doc(db, `${TEST_COLLECTION}/${testDocId}`);
                const docData = await getDocData({
                  docRef,
                  isFromCache: false,
                });

                if (!docData) {
                  setDocData(null);
                  setError(
                    'Document not found. Please create a document first.'
                  );
                  return;
                }

                if (
                  docData.data &&
                  'title' in docData.data &&
                  'qty' in docData.data &&
                  'desc' in docData.data
                ) {
                  setDocData({
                    title: docData.data.title,
                    qty: docData.data.qty,
                    desc: docData.data.desc,
                  } as DocumentData);
                } else {
                  setDocData(null);
                  setError(
                    `Document data does not match the expected structure. Found: ${JSON.stringify(
                      docData
                    )}`
                  );
                }
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            {testDocId
              ? `Fetch Document Data (ID: ${testDocId.substring(0, 8)}...)`
              : 'Fetch Document Data'}
          </button>
          {docData && (
            <CollapsibleDataDisplay
              data={docData}
              title='Document Data'
              testId='doc-data-result'
              className='text-green-500 mt-2 p-2 bg-gray-50 rounded overflow-auto'
            />
          )}
        </div>
      </div>

      {/* Get Documents Data */}
      <div className='border rounded p-4 bg-white mt-4'>
        <h3 className='font-medium mb-2'>Get Documents Data</h3>
        <button
          className='w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700'
          data-testid='get-docs-data'
          onClick={async () => {
            try {
              setLoading(true);
              setError(null);
              const compositeFilterConstraint = and(
                where('desc', '!=', 'desc')
              );
              const query = createQuery({
                collectionRef: collection(db, TEST_COLLECTION),
                compositeFilterConstraint,
              });
              const docsData = await getDocsData({
                query,
                isFromCache: false,
              });
              setDocsData(docsData);
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setLoading(false);
            }
          }}
        >
          Fetch Multiple Documents Data
        </button>
        {docsData && (
          <CollapsibleDataDisplay
            data={docsData}
            title='Multiple Documents Data'
            testId='docs-data-result'
            className='text-green-500 mt-2 p-2 bg-gray-50 rounded overflow-auto'
          />
        )}
      </div>

      {/* Update Custom ID Document Operations */}
      {customIdCreated && customId && (
        <div className='border rounded p-4 bg-white mt-4'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-medium'>Update Custom ID Document</h3>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-600'>ID: {customId}</span>
              <button
                onClick={clearUpdateResults}
                className='px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Update Operations */}
          <div className='space-y-3'>
            {/* Update Document Field with Simple Value */}
            <button
              className='w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700'
              onClick={() => {
                setUpdateResult('primitive', 'pending', 'Updating field...');
                updatePrimitiveField({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docId: customId,
                  onSuccess: ({ updatedValue, watchedValue, status }) => {
                    const isSuccess = status.includes('verified');
                    setUpdateResult(
                      'primitive',
                      isSuccess ? 'success' : 'error',
                      isSuccess
                        ? `✓ Field updated successfully! New value: ${updatedValue}`
                        : `✗ Update failed. Expected: ${updatedValue}, Got: ${watchedValue}`
                    );
                  },
                  onError: (err) =>
                    setUpdateResult(
                      'primitive',
                      'error',
                      `✗ Error: ${err.message}`
                    ),
                  setLoading,
                });
              }}
            >
              Update Document Field with Simple Value
            </button>

            {/* Array Field Operations */}
            <div className='border rounded p-3 bg-gray-50'>
              <h4 className='font-medium mb-2 text-gray-700'>
                Array Field Operations
              </h4>
              <div className='space-y-2'>
                <button
                  className='w-full px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700'
                  onClick={() => {
                    const newElements = [
                      `test_${Date.now()}`,
                      `array_${Date.now()}`,
                    ];
                    setAddedElements(newElements);
                    setUpdateResult(
                      'arrayUnion',
                      'pending',
                      'Adding elements to array...'
                    );
                    updateArrayUnion({
                      db,
                      collectionPath: TEST_COLLECTION,
                      docId: customId,
                      elementsToAdd: newElements,
                      onSuccess: ({ updatedValue, watchedValue, status }) => {
                        const isSuccess = status.includes('verified');
                        setUpdateResult(
                          'arrayUnion',
                          isSuccess ? 'success' : 'error',
                          isSuccess
                            ? `✓ Elements added successfully! Added: ${JSON.stringify(
                                updatedValue
                              )}`
                            : `✗ Add failed. Expected: ${JSON.stringify(
                                updatedValue
                              )}, Got: ${JSON.stringify(watchedValue)}`
                        );
                      },
                      onError: (err) =>
                        setUpdateResult(
                          'arrayUnion',
                          'error',
                          `✗ Error: ${err.message}`
                        ),
                      setLoading,
                    });
                  }}
                >
                  Add Elements to Array Field
                </button>

                <button
                  className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                  disabled={addedElements.length === 0}
                  onClick={() => {
                    setUpdateResult(
                      'arrayRemove',
                      'pending',
                      'Removing elements from array...'
                    );
                    updateArrayRemove({
                      db,
                      collectionPath: TEST_COLLECTION,
                      docId: customId,
                      elementsToRemove: addedElements,
                      onSuccess: ({ updatedValue, watchedValue, status }) => {
                        const isSuccess = status.includes('verified');
                        setUpdateResult(
                          'arrayRemove',
                          isSuccess ? 'success' : 'error',
                          isSuccess
                            ? `✓ Elements removed successfully! Removed: ${JSON.stringify(
                                updatedValue
                              )}`
                            : `✗ Remove failed. Expected: ${JSON.stringify(
                                updatedValue
                              )}, Got: ${JSON.stringify(watchedValue)}`
                        );
                        setAddedElements([]);
                      },
                      onError: (err) =>
                        setUpdateResult(
                          'arrayRemove',
                          'error',
                          `✗ Error: ${err.message}`
                        ),
                      setLoading,
                    });
                  }}
                >
                  Remove Elements from Array Field
                  {addedElements.length > 0 && (
                    <span className='text-xs block mt-1 opacity-75'>
                      Will remove: {addedElements.join(', ')}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Increment Numeric Field */}
            <button
              className='w-full px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700'
              onClick={() => {
                setUpdateResult(
                  'increment',
                  'pending',
                  'Incrementing numeric field...'
                );
                updateIncrement({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docId: customId,
                  onSuccess: ({ updatedValue, watchedValue, status }) => {
                    const isSuccess = status.includes('verified');
                    setUpdateResult(
                      'increment',
                      isSuccess ? 'success' : 'error',
                      isSuccess
                        ? `✓ Field incremented successfully! New value: ${updatedValue}`
                        : `✗ Increment failed. Expected: ${updatedValue}, Got: ${watchedValue}`
                    );
                  },
                  onError: (err) =>
                    setUpdateResult(
                      'increment',
                      'error',
                      `✗ Error: ${err.message}`
                    ),
                  setLoading,
                });
              }}
            >
              Increment Numeric Field by 1
            </button>

            {/* Update Multiple Document Fields */}
            <button
              className='w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700'
              onClick={() => {
                setUpdateResult(
                  'object',
                  'pending',
                  'Updating multiple fields...'
                );
                updateObjectFields({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docId: customId,
                  onSuccess: ({ updatedValue, watchedValue, status }) => {
                    const isSuccess = status.includes('verified');
                    setUpdateResult(
                      'object',
                      isSuccess ? 'success' : 'error',
                      isSuccess
                        ? `✓ Multiple fields updated successfully!`
                        : `✗ Object update failed. Expected: ${JSON.stringify(
                            updatedValue
                          )}, Got: ${JSON.stringify(watchedValue)}`
                    );
                  },
                  onError: (err) =>
                    setUpdateResult(
                      'object',
                      'error',
                      `✗ Error: ${err.message}`
                    ),
                  setLoading,
                });
              }}
            >
              Update Multiple Document Fields
            </button>
          </div>

          {/* Update Results Display */}
          {Object.keys(updateResults).length > 0 && (
            <div className='mt-4 space-y-2'>
              <h4 className='font-medium text-gray-700'>Operation Results:</h4>
              {Object.entries(updateResults)
                .sort(([, a], [, b]) => b.timestamp - a.timestamp)
                .map(([operation, result]) => (
                  <div
                    key={`${operation}-${result.timestamp}`}
                    className={`p-3 rounded border ${
                      result.status === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : result.status === 'error'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='font-medium capitalize'>
                        {operation.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className='text-sm mt-1'>{result.message}</p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentOperations;
