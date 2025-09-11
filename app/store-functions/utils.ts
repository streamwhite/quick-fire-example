import { TEST_COLLECTION } from '@/tests/store/constants';
import { Map } from 'immutable';
import { DocumentData, DocumentWithId } from 'quick-fire-store';
import * as R from 'ramda';
import { v4 as uuidv4 } from 'uuid';

// Constants
export const CONSTANTS = Map({
  TEST_DOC_ID: uuidv4(),
  ANOTHER_TEST_DOC_ID: 'hmda9nf43dfB8PSFlBsg',
  TEST_COLLECTION,
  WATCH_UPDATE_TIMEOUT: 1000,
  DOCS_WATCH_TIMEOUT: 2000,
  RANDOM_NUMBER_MIN: 1,
  RANDOM_NUMBER_MAX: 100,
  RANDOM_LIKES_MAX: 50,
  RANDOM_USER_MAX: 1000,
});

// Property types for updates
export const UPDATEABLE_PROPS = ['qty', 'title', 'desc'] as const;
export type UpdateableProperty = (typeof UPDATEABLE_PROPS)[number];

// Random value generators
export const generateRandomNumber = (
  min: number = CONSTANTS.get('RANDOM_NUMBER_MIN'),
  max: number = CONSTANTS.get('RANDOM_NUMBER_MAX')
): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateRandomProperty = (): UpdateableProperty =>
  UPDATEABLE_PROPS[Math.floor(Math.random() * UPDATEABLE_PROPS.length)];

export const generateRandomValueByProperty = (
  property: UpdateableProperty
): string | number => {
  const generators = Map({
    qty: () => generateRandomNumber(),
    title: () => `Updated Title ${Date.now()}`,
    desc: () => `Updated Description ${Date.now()}`,
  });

  return generators.get(property, () => 0)();
};

// Comment data generators
export const generateCommentData = (commentIndex: number, postId: string) => ({
  content: `This is comment ${commentIndex + 1} for post ${postId}`,
  author: `user_${generateRandomNumber(1, CONSTANTS.get('RANDOM_USER_MAX'))}`,
  likes: generateRandomNumber(0, CONSTANTS.get('RANDOM_LIKES_MAX') - 1),
  postId,
});

// Functional helpers using Ramda
export const isValidNumber = R.both(R.is(Number), Number.isFinite);
export const isNonEmptyString = R.both(R.is(String), R.complement(R.isEmpty));
export const isNonEmptyArray = R.both(R.is(Array), R.complement(R.isEmpty));

// Document data helpers
export const extractDocumentData = (
  doc: DocumentWithId<DocumentData>
): DocumentData => doc.data as DocumentData;

export const getPropertyFromDoc = R.curry(
  (property: string, doc: DocumentWithId<DocumentData>) =>
    R.path(['data', property], doc)
);

// Validation helpers
export const validateCommentStructure = (
  comment: unknown
): comment is Record<string, unknown> => {
  if (!R.is(Object, comment) || R.isNil(comment)) return false;
  const requiredFields = ['content', 'author', 'likes', 'createdAt'];
  return R.all(R.has(R.__, comment), requiredFields);
};

export const validateDocumentStructure = (
  doc: unknown
): doc is { id: string; data: unknown } => {
  if (!R.is(Object, doc) || R.isNil(doc)) return false;
  return R.has('id', doc) && R.has('data', doc);
};

// Array helpers using functional approach
export const mapWithIndex = R.addIndex(R.map);
export const filterValidDocuments = R.filter(validateDocumentStructure);
export const filterValidComments = R.filter(validateCommentStructure);

// Promise helpers
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Error handling helpers
export const safeJsonParse = R.tryCatch(JSON.parse, R.always(null));
export const safeJsonStringify = R.tryCatch(
  (obj: unknown) => JSON.stringify(obj, null, 2),
  R.always('{}')
);

// State update helpers
export const createStateUpdater = <T>(setter: (value: T) => void) =>
  R.curry((value: T) => setter(value));

// Verification status helpers
export const VERIFICATION_STATUSES = Map({
  PRIMITIVE_VERIFIED: 'primitive-verified',
  PRIMITIVE_MISMATCH: 'primitive-mismatch',
  ARRAY_UNION_VERIFIED: 'arrayUnion-verified',
  ARRAY_UNION_MISMATCH: 'arrayUnion-mismatch',
  INCREMENT_VERIFIED: 'increment-verified',
  INCREMENT_MISMATCH: 'increment-mismatch',
  ARRAY_REMOVE_VERIFIED: 'arrayRemove-verified',
  ARRAY_REMOVE_MISMATCH: 'arrayRemove-mismatch',
  OBJECT_VERIFIED: 'object-verified',
  OBJECT_MISMATCH: 'object-mismatch',
});

export const isVerified = (status: string): boolean =>
  status.includes('-verified');

export const getVerificationStatus = (
  success: boolean,
  operationType: string
): string => {
  const suffix = success ? 'verified' : 'mismatch';
  return `${operationType}-${suffix}`;
};

// CSS class helpers
export const CSS_CLASSES = Map({
  SUCCESS_TEXT: 'text-green-500',
  ERROR_TEXT: 'text-red-500',
  SUCCESS_BG: 'bg-green-100',
  ERROR_BG: 'bg-red-100',
  GRADIENT_BG: 'bg-gradient-to-r from-blue-50 to-indigo-50',
  BORDER_BLUE: 'border border-blue-200',
  BORDER_GREEN: 'border border-green-200',
  TEXT_GREEN: 'text-green-700',
  TEXT_BLUE: 'text-blue-700',
});

// Button styling helpers
export const getButtonClass = (baseColor: string): string =>
  `w-full px-4 py-2 bg-${baseColor}-600 text-white rounded hover:bg-${baseColor}-700`;

// Test ID helpers
export const TEST_IDS = Map({
  UPDATE_DOC: 'update-doc',
  UPDATE_DOC_ARRAY: 'update-doc-array',
  UPDATE_DOC_INCREMENT: 'update-doc-increment',
  UPDATE_DOC_REMOVE_ARRAY: 'update-doc-remove-array',
  UPDATE_DOC_WITH_OBJECT: 'update-doc-with-object',
  VERIFICATION_RESULTS: 'update-verification-results',
  VERIFICATION_STATUS: 'verification-status',
  UPDATED_VALUE: 'updated-value',
  WATCHED_VALUE: 'watched-value',
  COLLECTION_GROUP_QUERY: 'test-collection-group-query',
  CREATED_COMMENTS_DATA: 'created-comments-data',
  COLLECTION_GROUP_QUERY_RESULTS: 'collection-group-query-results',
});

// Success messages
export const SUCCESS_MESSAGES = Map({
  PRIMITIVE_UPDATE: 'Document field successfully updated with primitive value!',
  ARRAY_UNION: 'Array successfully updated with new elements!',
  INCREMENT: 'Field successfully incremented!',
  ARRAY_REMOVE: 'Elements successfully removed from array!',
  OBJECT_UPDATE: 'Multiple fields successfully updated!',
  FIELD_DELETED: 'Field successfully deleted!',
  DOC_CREATED: 'Document successfully created!',
});

// Error messages
export const ERROR_MESSAGES = Map({
  PRIMITIVE_UPDATE: 'Document field update failed. Please try again.',
  ARRAY_UNION: 'Array update failed. Please try again.',
  INCREMENT: 'Field increment failed. Please try again.',
  ARRAY_REMOVE: 'Array remove failed. Please try again.',
  OBJECT_UPDATE: 'Object update failed. Please try again.',
  DOC_CREATE_FAILED: 'Failed to create document',
  DOC_EXISTS: 'Document with this ID already exists!',
});

// Functional composition helpers
export const pipe = R.pipe;
export const compose = R.compose;
export const curry = R.curry;

// Type guards
export const isDocumentWithId = (
  obj: unknown
): obj is DocumentWithId<DocumentData> => validateDocumentStructure(obj);

export const isDocumentData = (obj: unknown): obj is DocumentData =>
  R.is(Object, obj) && !R.isNil(obj);
