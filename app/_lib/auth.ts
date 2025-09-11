import { getAuth } from 'quick-fire-auth';
import { config } from './config';

const auth = getAuth(config);

export { auth, config };
