'use client';
import { createDoc, deleteField } from 'quick-fire-store';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  updateArrayRemove,
  updateArrayUnion,
  updateIncrement,
  updateObjectFields,
  updatePrimitiveField,
} from '../updateOperations';
import {
  CONSTANTS,
  CSS_CLASSES,
  SUCCESS_MESSAGES,
  TEST_IDS,
  safeJsonStringify,
} from '../utils';
import { BaseComponentProps, DocumentData } from './types';

const TEST_COLLECTION = CONSTANTS.get('TEST_COLLECTION');

export const UpdateOperations: React.FC<BaseComponentProps> = ({
  db,
  setError,
  setLoading,
}) => {
  const [isDocCreated, setIsDocCreated] = useState(false);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);
  const [updatedValue, setUpdatedValue] = useState<string | number | null>(
    null
  );
  const [watchedValue, setWatchedValue] = useState<string | number | null>(
    null
  );
  const [watchedDocData, setWatchedDocData] = useState<DocumentData | null>(
    null
  );
  const [addedElements, setAddedElements] = useState<string[]>([]);

  // Create document function
  const createTestDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a new UUID for each document creation
      const customDocId = uuidv4();

      const docData = {
        title: 'Test Document',
        desc: 'This is a test document for update operations',
        qty: 10,
        tags: ['test', 'document', 'update'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await createDoc({
        db,
        collectionPath: TEST_COLLECTION,
        docCustomId: customDocId,
        docData,
      });

      // Set up watch to get the created document data
      const { watchDoc } = await import('quick-fire-store');
      const { doc: createDocRef } = await import('quick-fire-store');

      const docRef = createDocRef(db, `${TEST_COLLECTION}/${customDocId}`);

      const watchResult = watchDoc({
        documentRef: docRef,
        includeMetadataChanges: false,
        source: 'default',
        onError: (err) => {
          console.error('Watch error:', err);
        },
        onSnapshot: (info) => {
          if (info.data) {
            const watchedDocData = info.data as unknown as DocumentData;
            setWatchedDocData(watchedDocData);
            setWatchedValue(JSON.stringify(watchedDocData));
            setUpdatedValue(JSON.stringify(docData)); // Set the created document data as updated value
            watchResult.unsubscribe(); // Clean up after getting the data
          }
        },
      });

      setCreatedDocId(customDocId);
      setIsDocCreated(true);
    } catch (err) {
      setError((err as Error).message);
      setIsDocCreated(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='border rounded p-4 bg-white'>
      <h3 className='font-medium mb-2'>Update Document</h3>
      <div className='space-y-2'>
        {/* Create Document Button */}
        <button
          className='w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4'
          data-testid='create-document'
          onClick={createTestDocument}
        >
          Create Test Document
        </button>
        {isDocCreated && (
          <p
            className='text-green-500 text-center mb-4'
            data-testid='create-document-result'
          >
            {SUCCESS_MESSAGES.get('DOC_CREATED')}
          </p>
        )}
        <button
          className='w-full px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700'
          data-testid={TEST_IDS.get('UPDATE_DOC')}
          onClick={() => {
            updatePrimitiveField({
              db,
              collectionPath: TEST_COLLECTION,
              docId: createdDocId || '',
              onSuccess: ({ updatedValue, watchedValue, watchedDocData }) => {
                setUpdatedValue(updatedValue as string | number);
                setWatchedValue(watchedValue as string | number);
                setWatchedDocData(watchedDocData || null);
              },
              onError: (err) => setError(err.message),
              setLoading,
            });
          }}
        >
          Update Document Field with Simple Value
        </button>

        {/* Array Operations Group */}
        <div className='border rounded p-3 bg-gray-50'>
          <h4 className='font-medium mb-2 text-gray-700'>
            Array Field Operations
          </h4>
          <div className='space-y-2'>
            <button
              className='w-full px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700'
              data-testid={TEST_IDS.get('UPDATE_DOC_ARRAY')}
              onClick={() => {
                const newElements = [
                  `test_${Date.now()}`,
                  `array_${Date.now()}`,
                ];
                setAddedElements(newElements);
                updateArrayUnion({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docId: createdDocId || '',
                  elementsToAdd: newElements,
                  onSuccess: ({
                    updatedValue,
                    watchedValue,
                    watchedDocData,
                  }) => {
                    setUpdatedValue(updatedValue as string | number);
                    setWatchedValue(watchedValue as string | number);
                    setWatchedDocData(watchedDocData || null);
                  },
                  onError: (err) => setError(err.message),
                  setLoading,
                });
              }}
            >
              Add Elements to Array Field(tags)
            </button>

            <button
              className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
              data-testid={TEST_IDS.get('UPDATE_DOC_REMOVE_ARRAY')}
              disabled={addedElements.length === 0}
              onClick={() => {
                updateArrayRemove({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docId: createdDocId || '',
                  elementsToRemove: addedElements,
                  onSuccess: ({
                    updatedValue,
                    watchedValue,
                    watchedDocData,
                  }) => {
                    setUpdatedValue(updatedValue as string | number);
                    setWatchedValue(watchedValue as string | number);
                    setWatchedDocData(watchedDocData || null);
                    setAddedElements([]); // Clear added elements after removal
                  },
                  onError: (err) => setError(err.message),
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

        <button
          className='w-full px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700'
          data-testid={TEST_IDS.get('UPDATE_DOC_INCREMENT')}
          onClick={() => {
            updateIncrement({
              db,
              collectionPath: TEST_COLLECTION,
              docId: createdDocId || '',
              onSuccess: ({ updatedValue, watchedValue, watchedDocData }) => {
                setUpdatedValue(updatedValue as string | number);
                setWatchedValue(watchedValue as string | number);
                setWatchedDocData(watchedDocData || null);
              },
              onError: (err) => setError(err.message),
              setLoading,
            });
          }}
        >
          Increment Numeric Field by 1(qty)
        </button>

        <button
          className='w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700'
          data-testid={TEST_IDS.get('UPDATE_DOC_WITH_OBJECT')}
          onClick={() => {
            updateObjectFields({
              db,
              collectionPath: TEST_COLLECTION,
              docId: createdDocId || '',
              onSuccess: ({ updatedValue, watchedValue, watchedDocData }) => {
                setUpdatedValue(updatedValue as string | number);
                setWatchedValue(watchedValue as string | number);
                setWatchedDocData(watchedDocData || null);
              },
              onError: (err) => setError(err.message),
              setLoading,
            });
          }}
        >
          Update Multiple Fields in a document
        </button>

        {/* Delete Field Operation */}
        <div className='mt-4'>
          <h3 className='font-medium mb-2'>Delete Field(tags)</h3>
          <button
            className='w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700'
            data-testid='delete-field'
            onClick={async () => {
              let watchResult: { unsubscribe: () => void } | null = null;
              try {
                setLoading(true);
                setError(null);

                // Set up watch before deletion
                const { watchDoc } = await import('quick-fire-store');
                const { doc: createDocRef } = await import('quick-fire-store');

                const docRef = createDocRef(
                  db,
                  `${TEST_COLLECTION}/${createdDocId || ''}`
                );

                watchResult = watchDoc({
                  documentRef: docRef,
                  includeMetadataChanges: false,
                  source: 'default',
                  onError: (err) => {
                    console.error('Watch error:', err);
                    setLoading(false);
                  },
                  onSnapshot: (info) => {
                    if (info.data) {
                      const watchedDocData =
                        info.data as unknown as DocumentData;
                      setWatchedDocData(watchedDocData);
                      setWatchedValue(JSON.stringify(watchedDocData));
                      setUpdatedValue('tags field deleted');
                    }
                  },
                });

                // Delete the tags field
                await deleteField({
                  db,
                  docPath: `${TEST_COLLECTION}/${createdDocId || ''}`,
                  field: 'tags',
                });

                // Clean up watch after a short delay to ensure it catches the update
                setTimeout(() => {
                  if (watchResult) {
                    watchResult.unsubscribe();
                  }
                }, 1000);
              } catch (err) {
                setError((err as Error).message);
                if (watchResult) {
                  watchResult.unsubscribe();
                }
              } finally {
                setLoading(false);
              }
            }}
          >
            Delete Field
          </button>
        </div>

        {/* Verification Results Display */}
        {updatedValue !== null && watchedValue !== null && (
          <div
            className={`mt-4 p-4 ${CSS_CLASSES.get(
              'GRADIENT_BG'
            )} ${CSS_CLASSES.get('BORDER_BLUE')} rounded-lg`}
            data-testid={TEST_IDS.get('VERIFICATION_RESULTS')}
          >
            <h4 className='font-semibold mb-3 text-blue-800'>
              Update Verification Results:
            </h4>
            <div className='space-y-4'>
              <div>
                <strong className='text-gray-700'>Updated Value:</strong>
                <pre
                  data-testid={TEST_IDS.get('UPDATED_VALUE')}
                  className={`${CSS_CLASSES.get(
                    'TEXT_GREEN'
                  )} mt-1 p-3 bg-white ${CSS_CLASSES.get(
                    'BORDER_GREEN'
                  )} rounded-md overflow-auto text-sm font-mono`}
                >
                  {safeJsonStringify(
                    typeof updatedValue === 'string' &&
                      (updatedValue.startsWith('[') ||
                        updatedValue.startsWith('{'))
                      ? JSON.parse(updatedValue)
                      : updatedValue
                  )}
                </pre>
              </div>
              <div>
                <strong className='text-gray-700'>Watched Doc:</strong>
                <pre
                  data-testid={TEST_IDS.get('WATCHED_VALUE')}
                  className={`${CSS_CLASSES.get(
                    'TEXT_BLUE'
                  )} mt-1 p-3 bg-white ${CSS_CLASSES.get(
                    'BORDER_BLUE'
                  )} rounded-md overflow-auto text-sm font-mono`}
                >
                  {safeJsonStringify(watchedDocData || watchedValue)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateOperations;
