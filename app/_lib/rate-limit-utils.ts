import { CommentData, PostData } from '../store-functions/components/types';

/**
 * Creates a new post with proper timestamps and rate limiting considerations
 */
export const createPostData = (
  title: string,
  content: string,
  author: string,
  tags?: string[]
): PostData => {
  const now = new Date();
  return {
    title,
    content,
    author,
    createdAt: now,
    updatedAt: now,
    tags: tags || [],
    likes: 0,
  };
};

/**
 * Creates a new comment with proper timestamps and rate limiting considerations
 */
export const createCommentData = (
  content: string,
  author: string,
  postId: string
): CommentData => {
  const now = new Date();
  return {
    content,
    author,
    postId,
    createdAt: now,
    updatedAt: now,
    likes: 0,
  };
};

/**
 * Updates the updatedAt timestamp for a post
 */
export const updatePostTimestamp = (post: PostData): PostData => {
  return {
    ...post,
    updatedAt: new Date(),
  };
};

/**
 * Updates the updatedAt timestamp for a comment
 */
export const updateCommentTimestamp = (comment: CommentData): CommentData => {
  return {
    ...comment,
    updatedAt: new Date(),
  };
};

/**
 * Rate limiting configuration constants
 */
export const RATE_LIMIT_CONFIG = {
  POSTS_PER_15_MIN: 50,
  COMMENTS_PER_15_MIN: 50,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes in milliseconds
} as const;

/**
 * Helper function to check if a timestamp is within the rate limit window
 */
export const isWithinRateLimitWindow = (
  timestamp: Date | string,
  windowMs: number = RATE_LIMIT_CONFIG.WINDOW_MS
): boolean => {
  const now = new Date();
  const timestampDate =
    typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const timeDiff = now.getTime() - timestampDate.getTime();
  return timeDiff <= windowMs;
};

/**
 * Helper function to get rate limit status message
 */
export const getRateLimitMessage = (
  remaining: number,
  resetTime: number
): string => {
  const timeUntilReset = Math.ceil((resetTime - Date.now()) / 1000 / 60); // minutes

  if (remaining === 0) {
    return `Rate limit exceeded. Try again in ${timeUntilReset} minutes.`;
  }

  return `${remaining} requests remaining. Resets in ${timeUntilReset} minutes.`;
};
