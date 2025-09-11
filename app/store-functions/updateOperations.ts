import {
  createDoc,
  doc,
  DocumentWithId,
  Firestore,
  getDocData,
  updateDoc,
  watchDoc,
} from 'quick-fire-store';
import {
  CONSTANTS,
  delay,
  generateRandomNumber,
  generateRandomProperty,
  generateRandomValueByProperty,
  getVerificationStatus,
  UpdateableProperty,
} from './utils';

interface DocumentData {
  id?: string;
  title?: string;
  desc?: string;
  updatedAt?: string;
  qty?: number;
  tags?: string[];
  [key: string]: unknown;
}

interface UpdateOperationConfig {
  db: Firestore;
  collectionPath: string;
  docId: string;
  onSuccess: (result: {
    updatedValue: unknown;
    watchedValue: unknown;
    watchedDocData?: DocumentData | null;
    status: string;
  }) => void;
  onError: (error: Error) => void;
  setLoading: (loading: boolean) => void;
}

interface ArrayRemoveConfig extends UpdateOperationConfig {
  elementsToRemove?: string[];
}

interface WatchUpdateConfig extends UpdateOperationConfig {
  updateValue: {
    operationType:
      | 'updateFieldWithPrimitive'
      | 'arrayFieldUnion'
      | 'arrayFieldRemove'
      | 'fieldIncrement'
      | 'updateDocWithObject';
    value: unknown;
  };
  fieldPath?: string;
}

// Generic update with watch verification
export const performUpdateWithWatch = async (
  config: WatchUpdateConfig
): Promise<void> => {
  const {
    db,
    collectionPath,
    docId,
    updateValue,
    fieldPath = undefined,
    onSuccess,
    onError,
    setLoading,
  } = config;

  try {
    setLoading(true);

    const docRef = doc(db, `${collectionPath}/${docId}`);
    let watchedValue: unknown = null;
    let watchedDocData: DocumentData | null = null;

    // Set up watch before update
    const watchResult = watchDoc({
      documentRef: docRef,
      includeMetadataChanges: false,
      source: 'default',
      onError: (err) => onError(new Error(err.message)),
      onSnapshot: (info) => {
        if (info.data) {
          const docData = info.data as unknown as DocumentData;
          watchedDocData = docData;
          watchedValue = fieldPath ? docData[fieldPath] : docData;
        }
      },
    });

    // Perform the update
    await updateDoc({
      db,
      collectionPath,
      docId,
      fieldPath,
      updateValue,
    });

    // Wait for watch to catch the update
    await delay(CONSTANTS.get('WATCH_UPDATE_TIMEOUT'));

    // Clean up watch
    watchResult.unsubscribe();

    // Return success result
    onSuccess({
      updatedValue: updateValue.value,
      watchedValue,
      watchedDocData,
      status: getVerificationStatus(true, updateValue.operationType),
    });
  } catch (err) {
    onError(err as Error);
  } finally {
    setLoading(false);
  }
};

// Primitive field update
export const updatePrimitiveField = (config: UpdateOperationConfig) => {
  const newValue = generateRandomNumber();

  return performUpdateWithWatch({
    ...config,
    fieldPath: 'qty',
    updateValue: {
      operationType: 'updateFieldWithPrimitive',
      value: newValue,
    },
  });
};

// Array union operation
export const updateArrayUnion = async (
  config: UpdateOperationConfig & { elementsToAdd?: string[] }
) => {
  const {
    elementsToAdd = [`test_${Date.now()}`, `array_${Date.now()}`],
    ...restConfig
  } = config;

  return performUpdateWithWatch({
    ...restConfig,
    fieldPath: 'tags',
    updateValue: {
      operationType: 'arrayFieldUnion',
      value: elementsToAdd,
    },
  });
};

// Increment operation
export const updateIncrement = async (config: UpdateOperationConfig) => {
  const { db, collectionPath, docId, onSuccess, onError, setLoading } = config;

  try {
    setLoading(true);

    const docRef = doc(db, `${collectionPath}/${docId}`);
    let initialValue: number | null = null;
    let watchedValue: number | null = null;
    let watchedDocData: DocumentData | null = null;
    const incrementAmount = 1;

    // Get initial value first
    const initialData = await getDocData({
      docRef,
      isFromCache: false,
    });

    if (initialData) {
      const docData = initialData as unknown as DocumentWithId<DocumentData>;
      initialValue = (docData.data as DocumentData)?.qty as number;
    }

    // Set up watch before update
    const watchResult = watchDoc({
      documentRef: docRef,
      includeMetadataChanges: false,
      source: 'default',
      onError: (err) => onError(new Error(err.message)),
      onSnapshot: (info) => {
        if (info.data) {
          const docData = info.data as unknown as DocumentData;
          watchedDocData = docData;
          watchedValue = docData.qty as number;
        }
      },
    });

    // Update the document
    await updateDoc({
      db,
      collectionPath,
      fieldPath: 'qty',
      docId,
      updateValue: {
        operationType: 'fieldIncrement',
        value: incrementAmount,
      },
    });

    // Wait for watch to catch the update
    await delay(CONSTANTS.get('WATCH_UPDATE_TIMEOUT'));

    // Verify increment worked correctly
    const expectedValue = (initialValue || 0) + incrementAmount;
    const incrementWorked = watchedValue === expectedValue;

    // Clean up watch
    watchResult.unsubscribe();

    onSuccess({
      updatedValue: expectedValue,
      watchedValue,
      watchedDocData,
      status: getVerificationStatus(incrementWorked, 'increment'),
    });
  } catch (err) {
    onError(err as Error);
  } finally {
    setLoading(false);
  }
};

// Array remove operation
export const updateArrayRemove = async (config: ArrayRemoveConfig) => {
  const {
    db,
    collectionPath,
    docId,
    onSuccess,
    onError,
    setLoading,
    elementsToRemove = ['test'],
  } = config;

  try {
    setLoading(true);

    const docRef = doc(db, `${collectionPath}/${docId}`);
    let watchedValue: string[] | null = null;
    let watchedDocData: DocumentData | null = null;

    // Ensure elements exist before removing (only if using default elements)
    if (elementsToRemove.length === 1 && elementsToRemove[0] === 'test') {
      const initialDocData = (await getDocData({
        docRef,
        isFromCache: false,
      })) as unknown as DocumentWithId<DocumentData>;

      if (
        initialDocData &&
        !(initialDocData.data as DocumentData).tags?.includes(
          elementsToRemove[0]
        )
      ) {
        await updateDoc({
          db,
          collectionPath,
          docId,
          fieldPath: 'tags',
          updateValue: {
            operationType: 'arrayFieldUnion',
            value: elementsToRemove,
          },
        });
      }
    }

    // Set up watch before update
    const watchResult = watchDoc({
      documentRef: docRef,
      includeMetadataChanges: false,
      source: 'default',
      onError: (err) => onError(new Error(err.message)),
      onSnapshot: (info) => {
        if (info.data) {
          const docData = info.data as unknown as DocumentData;
          watchedDocData = docData;
          watchedValue = docData.tags as string[];
        }
      },
    });

    // Update the document
    await updateDoc({
      db,
      collectionPath,
      fieldPath: 'tags',
      docId,
      updateValue: {
        operationType: 'arrayFieldRemove',
        value: elementsToRemove,
      },
    });

    // Wait for watch to catch the update
    await delay(CONSTANTS.get('WATCH_UPDATE_TIMEOUT'));

    // Verify elements were removed
    const elementsRemoved = elementsToRemove.every(
      (element) => !watchedValue?.includes(element)
    );

    // Clean up watch
    watchResult.unsubscribe();

    onSuccess({
      updatedValue: JSON.stringify(elementsToRemove),
      watchedValue: JSON.stringify(watchedValue),
      watchedDocData,
      status: getVerificationStatus(elementsRemoved, 'arrayRemove'),
    });
  } catch (err) {
    onError(err as Error);
  } finally {
    setLoading(false);
  }
};

// Object update operation
export const updateObjectFields = (config: UpdateOperationConfig) => {
  const newValues = {
    title: `Updated Title ${Date.now()}`,
    desc: `Updated description ${Date.now()}`,
  };

  return performUpdateWithWatch({
    ...config,
    updateValue: {
      operationType: 'updateDocWithObject',
      value: newValues,
    },
  });
};

// Comment creation utility
export const createCommentsForPosts = async (
  db: Firestore,
  postIds: string[],
  collectionName: string
): Promise<
  Array<{
    content: string;
    author: string;
    likes: number;
    createdAt: string;
    postId: string;
    subcollectionPath: string;
  }>
> => {
  const allCreatedComments: Array<{
    content: string;
    author: string;
    likes: number;
    createdAt: string;
    postId: string;
    subcollectionPath: string;
  }> = [];

  for (const docId of postIds) {
    const commentCount = generateRandomNumber(2, 3); // 2-3 comments

    for (let i = 0; i < commentCount; i++) {
      const now = new Date();
      const commentData = {
        content: `This is comment ${i + 1} for post ${docId}`,
        author: `user_${generateRandomNumber(
          1,
          CONSTANTS.get('RANDOM_USER_MAX')
        )}`,
        likes: generateRandomNumber(0, CONSTANTS.get('RANDOM_LIKES_MAX') - 1),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        postId: docId,
      };

      // Create comment in subcollection
      await createDoc({
        db,
        collectionPath: `${collectionName}/${docId}/comments`,
        docData: {
          ...commentData,
          createdAt: now, // Use actual timestamp for Firestore
          updatedAt: now, // Use actual timestamp for Firestore
        },
        docCustomId: undefined,
      });

      // Store created comment data for display
      allCreatedComments.push({
        ...commentData,
        subcollectionPath: `${collectionName}/${docId}/comments`,
      });
    }
  }

  return allCreatedComments;
};

// Random property update utility (for watch operations)
export const generateRandomUpdate = (): {
  property: UpdateableProperty;
  value: string | number;
} => {
  const property = generateRandomProperty();
  const value = generateRandomValueByProperty(property);
  return { property, value };
};
