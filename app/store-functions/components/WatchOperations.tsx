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
  updateDoc,
  watchDoc,
  watchDocs,
  where,
} from 'quick-fire-store';
import { useRef, useState } from 'react';
import { generateRandomUpdate } from '../updateOperations';
import { CONSTANTS } from '../utils';
import CollapsibleDataDisplay from './CollapsibleDataDisplay';
import { BaseComponentProps, DocumentData, DocumentUpdate } from './types';

const TEST_COLLECTION = CONSTANTS.get('TEST_COLLECTION');

export const WatchOperations: React.FC<BaseComponentProps> = ({
  db,
  setError,
  setLoading,
}) => {
  const [updatedValue, setUpdatedValue] = useState<string | number | null>(
    null
  );
  const [watchedValue, setWatchedValue] = useState<string | number | null>(
    null
  );
  const [propertyUpdated, setPropertyUpdated] = useState<string | null>(null);
  const [docsUpdates, setDocsUpdates] = useState<DocumentUpdate[]>([]);
  const currentDocDataRef =
    useRef<FirestoreDocumentWithId<DocumentData> | null>(null);
  const currentDocsDataRef = useRef<FirestoreDocumentWithId<DocumentData>[]>(
    []
  );

  // Document creation states
  const [watchDocCreated, setWatchDocCreated] = useState(false);
  const [watchDocId, setWatchDocId] = useState<string | null>(null);
  const [watchDocsCreated, setWatchDocsCreated] = useState(false);
  const [watchDocsIds, setWatchDocsIds] = useState<string[]>([]);
  const [watchMarker, setWatchMarker] = useState<string | null>(null);

  // Realtime display states
  const [realtimeDocData, setRealtimeDocData] = useState<DocumentData | null>(
    null
  );
  const [realtimeDocsData, setRealtimeDocsData] = useState<
    FirestoreDocumentWithId<DocumentData>[]
  >([]);

  return (
    <div className='mb-8 border rounded-lg p-4 bg-gray-50'>
      <h2 className='text-xl font-semibold mb-4'>real time watch Operations</h2>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {/* Watch Document */}
        <div className='border rounded p-4 bg-white'>
          <h3 className='font-medium mb-2'>Watch Document</h3>

          {/* Create Document Button */}
          <button
            className='w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-2'
            data-testid='create-watch-doc'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const result = await createDoc({
                  db,
                  collectionPath: TEST_COLLECTION,
                  docData: {
                    title: 'Watch Test Document',
                    qty: 5,
                    desc: 'This document will be watched for realtime updates',
                  },
                  docCustomId: undefined,
                });
                const docId = typeof result === 'string' ? result : result?.id;
                setWatchDocId(docId);
                setWatchDocCreated(true);

                // Fetch and display the created document data immediately
                if (docId) {
                  const docRef = doc(db, `${TEST_COLLECTION}/${docId}`);
                  const docData = await getDocData({
                    docRef,
                    isFromCache: false,
                  });
                  if (docData) {
                    setRealtimeDocData(docData.data as DocumentData);
                  }
                }
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Create Document for Watching
          </button>

          {/* Document Creation Status */}
          {watchDocCreated && watchDocId && (
            <div className='mb-3 p-2 bg-green-50 rounded border border-green-200'>
              <p className='text-green-700 text-sm'>
                ✓ Document created! ID: {watchDocId.substring(0, 8)}...
              </p>
            </div>
          )}

          {/* Realtime Data Display */}
          {realtimeDocData && (
            <div className='mb-3 p-2 bg-yellow-50 rounded border border-yellow-200'>
              <h4 className='text-sm font-medium text-yellow-800 mb-1'>
                Realtime Data:
              </h4>
              <CollapsibleDataDisplay
                data={realtimeDocData}
                title='Realtime Document Data'
                testId='realtime-doc-data'
                className='text-xs bg-white p-2 rounded'
              />
            </div>
          )}

          <button
            className='w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700'
            data-testid='watch-doc'
            disabled={!watchDocCreated}
            onClick={() => {
              if (!watchDocId) {
                setError('Please create a document first');
                return;
              }

              try {
                setLoading(true);
                setError(null);
                currentDocDataRef.current = null;

                const docRef = doc(db, `${TEST_COLLECTION}/${watchDocId}`);

                // First get the initial document data
                getDocData({
                  docRef,
                  isFromCache: false,
                })
                  .then((initialData) => {
                    const initialDocData = initialData;
                    currentDocDataRef.current =
                      initialDocData as FirestoreDocumentWithId<DocumentData>;

                    // Set initial realtime data
                    if (initialDocData) {
                      setRealtimeDocData(initialDocData.data as DocumentData);
                    }

                    // Pick a random property to update using utility
                    const { property: randomProp, value: newValue } =
                      generateRandomUpdate();

                    // Store the value we're updating to
                    setUpdatedValue(newValue);
                    setPropertyUpdated(randomProp);

                    // Set up the watch
                    watchDoc({
                      documentRef: docRef,
                      includeMetadataChanges: false,
                      source: 'default',
                      onError: (err) => {
                        setError(err.message);
                        setLoading(false);
                      },
                      onSnapshot: (info) => {
                        const newData = info.data;

                        if (currentDocDataRef.current && newData) {
                          const newDocData = newData as unknown as DocumentData;
                          const currentDocData =
                            currentDocDataRef.current as unknown as DocumentData;

                          // Update realtime display
                          setRealtimeDocData(newDocData);

                          if (
                            newDocData[randomProp] !==
                            currentDocData[randomProp]
                          ) {
                            setWatchedValue(
                              newDocData[randomProp] as string | number
                            );
                            setLoading(false);
                          }
                        }
                        currentDocDataRef.current =
                          newData as unknown as FirestoreDocumentWithId<DocumentData>;
                      },
                    });

                    // Update the document with new value after a short delay
                    setTimeout(async () => {
                      try {
                        await updateDoc({
                          db,
                          collectionPath: TEST_COLLECTION,
                          docId: watchDocId,
                          fieldPath: randomProp,
                          updateValue: {
                            operationType: 'updateFieldWithPrimitive',
                            value: newValue,
                          },
                        });
                      } catch (updateErr) {
                        setError((updateErr as Error).message);
                        setLoading(false);
                      }
                    }, 500);
                  })
                  .catch((err) => {
                    setError((err as Error).message);
                    setLoading(false);
                  });
              } catch (err) {
                setError((err as Error).message);
                setLoading(false);
              }
            }}
          >
            Watch Document and Update Random Property
          </button>
          {updatedValue !== null && watchedValue !== null && (
            <div className='mt-2' data-testid='watch-doc-value-comparison'>
              <div>Value Comparison:</div>
              <pre
                className='bg-gray-50 p-2 rounded mt-1 text-sm overflow-auto'
                data-testid='watch-doc-comparison-data'
              >
                {JSON.stringify(
                  {
                    propertyUpdated,
                    updatedTo: updatedValue,
                    receivedInWatch: watchedValue,
                    valuesMatch: updatedValue === watchedValue,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Watch Documents */}
        <div className='border rounded p-4 bg-white'>
          <h3 className='font-medium mb-2'>Watch Documents</h3>

          {/* Create Documents Button */}
          <button
            className='w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mb-2'
            data-testid='create-watch-docs'
            onClick={async () => {
              try {
                setLoading(true);
                setError(null);
                const docIds: string[] = [];

                // Create 2 documents for watching with a special marker
                const watchMarker = `watch-${Date.now()}`;
                for (let i = 0; i < 2; i++) {
                  const result = await createDoc({
                    db,
                    collectionPath: TEST_COLLECTION,
                    docData: {
                      title: `Watch Test Document ${i + 1}`,
                      qty: 10 + i,
                      desc: `This is document ${
                        i + 1
                      } for watching multiple documents`,
                      watchMarker: watchMarker,
                    },
                    docCustomId: undefined,
                  });
                  const docId =
                    typeof result === 'string' ? result : result?.id;
                  if (docId) docIds.push(docId);
                }

                setWatchDocsIds(docIds);
                setWatchDocsCreated(true);
                setWatchMarker(watchMarker);

                // Fetch and display the created documents data immediately
                if (docIds.length > 0) {
                  const query = createQuery({
                    collectionRef: collection(db, TEST_COLLECTION),
                    compositeFilterConstraint: and(
                      where('watchMarker', '==', watchMarker)
                    ),
                  });
                  const docsData = await getDocsData({
                    query,
                    isFromCache: false,
                  });
                  setRealtimeDocsData(docsData);
                }
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Create 2 Documents for Watching
          </button>

          {/* Documents Creation Status */}
          {watchDocsCreated && watchDocsIds.length > 0 && (
            <div className='mb-3 p-2 bg-green-50 rounded border border-green-200'>
              <p className='text-green-700 text-sm'>
                ✓ {watchDocsIds.length} documents created! IDs:{' '}
                {watchDocsIds.map((id) => id.substring(0, 8)).join(', ')}...
              </p>
            </div>
          )}

          {/* Realtime Data Display */}
          {realtimeDocsData.length > 0 && (
            <div className='mb-3 p-2 bg-yellow-50 rounded border border-yellow-200'>
              <h4 className='text-sm font-medium text-yellow-800 mb-1'>
                Realtime Data:
              </h4>
              <CollapsibleDataDisplay
                data={realtimeDocsData}
                title='Realtime Documents Data'
                testId='realtime-docs-data'
                className='text-xs bg-white p-2 rounded'
              />
            </div>
          )}

          <button
            className='w-full px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700'
            data-testid='watch-docs'
            disabled={!watchDocsCreated}
            onClick={async () => {
              if (!watchDocsCreated || watchDocsIds.length === 0) {
                setError('Please create documents first');
                return;
              }

              try {
                setLoading(true);
                setError(null);
                setDocsUpdates([]);
                currentDocsDataRef.current = [];

                // Create query to watch only the specific documents we created
                const query = createQuery({
                  collectionRef: collection(db, TEST_COLLECTION),
                  compositeFilterConstraint: and(
                    where('watchMarker', '==', watchMarker)
                  ),
                });

                // Set up the watch first
                watchDocs({
                  query,
                  includeMetadataChanges: false,
                  source: 'default',
                  onError: (err) => {
                    setError(err.message);
                    setLoading(false);
                  },
                  onSnapshot: (info) => {
                    const newData =
                      info.data as FirestoreDocumentWithId<DocumentData>[];
                    currentDocsDataRef.current = newData;

                    // Update realtime display
                    setRealtimeDocsData(newData);
                  },
                });

                // Get initial docs data for processing updates
                const initialDocs = await getDocsData({
                  query,
                  isFromCache: false,
                });

                // Process each document sequentially
                const WATCH_UPDATE_TIMEOUT =
                  CONSTANTS.get('DOCS_WATCH_TIMEOUT');

                for (const doc of initialDocs) {
                  const docId = doc.id;
                  // Use utility function to generate random update
                  const { property: randomProp, value: newValue } =
                    generateRandomUpdate();

                  try {
                    await updateDoc({
                      db,
                      collectionPath: TEST_COLLECTION,
                      docId,
                      fieldPath: randomProp,
                      updateValue: {
                        operationType: 'updateFieldWithPrimitive',
                        value: newValue,
                      },
                    });

                    // Wait for the watch to catch up
                    await new Promise((resolve) =>
                      setTimeout(resolve, WATCH_UPDATE_TIMEOUT)
                    );

                    // Get the current value after watch
                    const currentDoc = currentDocsDataRef.current.find(
                      (doc) => doc.id === docId
                    );
                    if (currentDoc) {
                      setDocsUpdates((prev) => [
                        ...prev,
                        {
                          docId,
                          property: randomProp,
                          updatedTo: newValue,
                          watchedValue: (currentDoc as unknown as DocumentData)[
                            randomProp
                          ] as string | number,
                        },
                      ]);
                    }
                  } catch (updateErr) {
                    setError((updateErr as Error).message);
                  }
                }
                setLoading(false);
              } catch (err) {
                setError((err as Error).message);
                setLoading(false);
              }
            }}
          >
            Watch and Update multiple Documents for random property
          </button>

          {docsUpdates.length > 0 && (
            <CollapsibleDataDisplay
              data={docsUpdates.map((update) => ({
                ...update,
                valuesMatch: update.updatedTo === update.watchedValue,
              }))}
              title='Updates Summary'
              testId='watch-docs-updates'
              className='bg-gray-50 p-2 rounded mt-1 text-sm overflow-auto'
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default WatchOperations;
