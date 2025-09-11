import { v4 as uuidv4 } from 'uuid';

export const TEST_DOC_ID = uuidv4();
export const TEST_COLLECTION = 'posts';
export const BASE_URL = 'http://localhost:3000/store-functions';
export const DOC_WATCH_TIMEOUT = 30000;
export const DOCS_WATCH_TIMEOUT = 2 * 1000;

// Generate a UUID for testing
export const generateTestId = () => uuidv4();
